/**
 * Map URL utilities for generating links to various map providers
 */

export type MapProvider = 'google' | 'openstreetmap' | 'yandex' | 'apple'

export interface MapUrlOptions {
  provider?: MapProvider
  zoom?: number
  marker?: boolean
  directions?: boolean
}

/**
 * Generate map URL for given coordinates and options
 */
export function generateMapUrl(
  lat: number,
  lng: number,
  options: MapUrlOptions = {}
): string {
  const { provider = 'google', zoom = 15, marker = true, directions = false } = options

  switch (provider) {
    case 'google':
      const googleParams = new URLSearchParams({
        q: directions ? `${lat},${lng}` : `${lat},${lng}${marker ? '' : ''}`,
        z: zoom.toString()
      })
      return `https://www.google.com/maps?${googleParams.toString()}`

    case 'openstreetmap':
      return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=${zoom}${marker ? '&layers=M' : ''}`

    case 'yandex':
      return `https://yandex.com/maps/?ll=${lng},${lat}&z=${zoom}${marker ? '&pt=' + lng + ',' + lat + ',pm2rdm' : ''}`

    case 'apple':
      return `https://maps.apple.com/?ll=${lat},${lng}&z=${zoom}&dirflg=d`

    default:
      return `https://www.google.com/maps?q=${lat},${lng}`
  }
}

/**
 * Generate short map URL for notifications and sharing
 */
export function generateShortMapUrl(lat: number, lng: number, provider: MapProvider = 'google'): string {
  return generateMapUrl(lat, lng, { provider, zoom: 16, marker: true })
}

/**
 * Generate map URL with directions mode
 */
export function generateDirectionsUrl(lat: number, lng: number, provider: MapProvider = 'google'): string {
  return generateMapUrl(lat, lng, { provider, zoom: 15, directions: true })
}

/**
 * Get available map providers
 */
export function getMapProviders(): { key: MapProvider; name: string; url: string }[] {
  return [
    { key: 'google', name: 'Google Maps', url: 'https://maps.google.com' },
    { key: 'openstreetmap', name: 'OpenStreetMap', url: 'https://www.openstreetmap.org' },
    { key: 'yandex', name: 'Yandex Maps', url: 'https://yandex.com/maps' },
    { key: 'apple', name: 'Apple Maps', url: 'https://maps.apple.com' }
  ]
}
