import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  initialLocation?: { lat: number; lng: number; address?: string }
}

interface SearchResult {
  place_id: string
  display_name: string
  lat: string
  lon: string
}

interface LocationMarkerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  initialPosition?: { lat: number; lng: number; address?: string }
}

// Error boundary component
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-96 flex flex-col items-center justify-center bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Harita yüklenirken bir hata oluştu</h3>
          <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
            Lütfen sayfayı yenileyin veya tekrar deneyin. Eğer sorun devam ederse, internet bağlantınızı kontrol edin.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Tekrar Dene
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function LocationMarker({ onLocationSelect, initialPosition }: LocationMarkerProps) {
  const [position, setPosition] = useState<{lat: number, lng: number, address?: string} | null>(initialPosition || null)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      const newPosition = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        address: ''
      }
      setPosition(newPosition)
      setIsLoadingAddress(true)

      // Try to get address for the clicked location
      fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/search/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }
      )
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then(data => {
          if (data && data.display_name) {
            const updatedPosition = {
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              address: data.display_name
            }
            setPosition(updatedPosition)
            onLocationSelect(e.latlng.lat, e.latlng.lng, data.display_name)
          } else {
            const address = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`
            onLocationSelect(e.latlng.lat, e.latlng.lng, address)
          }
        })
        .catch((error) => {
          console.error('Reverse geocoding error:', error)
          const address = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`
          onLocationSelect(e.latlng.lat, e.latlng.lng, address)
        })
        .finally(() => {
          setIsLoadingAddress(false)
        })
    },
  })

  if (!position) return null;

  return (
    <Marker position={[position.lat, position.lng]}>
      <Popup>
        <div className="text-sm min-w-[200px]">
          <div className="font-semibold text-green-700">📍 Seçilen Konum</div>
          <div className="text-gray-700">
            {isLoadingAddress ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-3 w-3 border border-green-500 border-t-transparent rounded-full"></div>
                <span>Adres yükleniyor...</span>
              </div>
            ) : (
              position.address || 'Adres bilgisi yok'
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

function MapEventHandler() {
  const map = useMap()

  useEffect(() => {
    if (map) {
      // Add tile loading event listeners for better UX
      map.on('tileloadstart', () => {
        // This could trigger a loading state if needed
      })
      map.on('tileload', () => {
        // This could trigger a loaded state if needed
      })
    }
  }, [map])

  return null
}

function MapSelectorInner({ onLocationSelect, initialLocation }: MapSelectorProps) {
  const defaultCenter: [number, number] = [39.9208, 32.8541] // Ankara, Turkey coordinates
  const [center, setCenter] = useState<[number, number]>(initialLocation ? [initialLocation.lat, initialLocation.lng] : defaultCenter)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Map instance and cleanup management
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    setIsClient(true)

    // Fix for default markers in react-leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Reset selectedIndex when search results change
  useEffect(() => {
    if (selectedIndex >= searchResults.length && searchResults.length > 0) {
      setSelectedIndex(-1)
    }
  }, [searchResults.length, selectedIndex])

  const searchLocations = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/search/geocode?q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const results: SearchResult[] = await response.json()

      if (!Array.isArray(results)) {
        throw new Error('Invalid response format')
      }

      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      // You could show a toast notification here
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedIndex(-1)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value)
    }, 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % searchResults.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev <= 0 ? searchResults.length - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          selectSearchResult(searchResults[selectedIndex])
        }
        break
      case 'Escape':
        setSearchResults([])
        setSelectedIndex(-1)
        break
    }
  }

  const selectSearchResult = (result: SearchResult): void => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    setCenter([lat, lng])
    onLocationSelect(lat, lng, result.display_name)

    setSearchResults([])
    setSearchQuery('')
    setSelectedIndex(-1)
  }

  const clearSearch = (): void => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
    setSelectedIndex(-1)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }
  }

  const [mapLoading, setMapLoading] = useState(true)

  if (!isClient) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
          <p className="text-sm text-gray-600">Harita yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative" style={{ position: 'relative', zIndex: 0, minHeight: '400px' }}>
        {mapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
              <p className="text-sm text-gray-600">Harita yükleniyor...</p>
            </div>
          </div>
        )}
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            whenReady={() => {
              console.log('✅ Map is ready!')
              setMapLoading(false)
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              eventHandlers={{
                loading: () => setMapLoading(true),
                load: () => setMapLoading(false)
              }}
            />
            <LocationMarker onLocationSelect={onLocationSelect} initialPosition={initialLocation} />
            <MapEventHandler />
          </MapContainer>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-4 relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyDown={handleKeyDown}
            placeholder="Şehir, ilçe, mahalle veya adres arayın..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            autoComplete="off"
            aria-expanded={searchResults.length > 0}
            aria-haspopup="listbox"
            aria-describedby="search-results"
          />
          <div className="absolute right-3 top-2.5 flex items-center space-x-1">
            {isSearching && (
              <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
            )}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Aramayı temizle"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div
            id="search-results"
            role="listbox"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              maxHeight: '12rem',
              overflowY: 'auto'
            }}
          >
            {searchResults.map((result, index) => (
              <button
                key={result.place_id}
                onClick={() => selectSearchResult(result)}
                role="option"
                aria-selected={index === selectedIndex}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 1rem',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: index === selectedIndex ? '#f3f4f6' : 'transparent'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                onMouseLeave={() => setSelectedIndex(-1)}
              >
                <div style={{ fontSize: '0.875rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {result.display_name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MapSelector({ onLocationSelect, initialLocation }: MapSelectorProps) {
  return (
    <MapErrorBoundary>
      <MapSelectorInner onLocationSelect={onLocationSelect} initialLocation={initialLocation} />
    </MapErrorBoundary>
  )
}
