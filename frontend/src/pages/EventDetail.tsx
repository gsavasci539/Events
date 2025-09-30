import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { eventsService, Event } from '@/services/events'
import MapSelector from '@/components/MapSelector'
import { generateShortMapUrl } from '@/utils/mapUtils'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id === 'new') { 
      setItem({ 
        id: 0, 
        title: '', 
        description: '', 
        location: '', 
        start_time: new Date().toISOString(),
        is_blocked: false 
      }); 
      setLoading(false); 
      return 
    }
    (async () => {
      try {
        if (!id) return
        const data = await eventsService.detail(Number(id))
        setItem(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const onSave = async () => {
    if (!item) return
    if (id === 'new') {
      const created = await eventsService.create(item)
      navigate(`/events/${created.id}`)
    } else {
      await eventsService.update(Number(id), item)
      alert('Kaydedildi')
    }
  }

  const onDelete = async () => {
    if (!id || id === 'new') return
    if (confirm('Silmek istediğinize emin misiniz?')) {
      await eventsService.remove(Number(id))
      navigate('/events')
    }
  }

  if (loading) return <div>Yükleniyor...</div>
  if (!item) return <div>Bulunamadı</div>

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Etkinlik Detayı</h1>
      <div className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block text-sm mb-1">Başlık</label>
          <input value={item.title} onChange={e=>setItem({...item, title: e.target.value})} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Açıklama</label>
          <textarea value={item.description || ''} onChange={e=>setItem({...item, description: e.target.value})} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Konum</label>
          <input value={item.location || ''} onChange={e=>setItem({...item, location: e.target.value})} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Başlangıç</label>
          <input
            type="datetime-local"
            value={item.start_time.slice(0,16)}
            onChange={e=>setItem({...item, start_time: new Date(e.target.value).toISOString()})}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Event Type Toggle */}
        <div>
          <label className="block text-sm mb-2 font-medium">Etkinlik Türü</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="eventType"
                checked={!item.is_online}
                onChange={() => setItem({...item, is_online: false})}
                className="mr-2"
              />
              Yüzyüze
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="eventType"
                checked={item.is_online}
                onChange={() => setItem({...item, is_online: true})}
                className="mr-2"
              />
              Çevrimiçi
            </label>
          </div>
        </div>

        {/* Online Link Field */}
        {item.is_online && (
          <div>
            <label className="block text-sm mb-1">Çevrimiçi Bağlantı</label>
            <input
              value={item.online_link || ''}
              onChange={e=>setItem({...item, online_link: e.target.value})}
              placeholder="Zoom, Teams veya diğer platform bağlantısını girin"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        )}

        {/* Location and Map Section - Show for offline events or when location exists */}
        {(!item.is_online || item.location || item.location_lat) && (
          <div>
            <label className="block text-sm mb-1">Konum</label>
            <input
              value={item.location || ''}
              onChange={e=>setItem({...item, location: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Etkinlik konumunu girin"
            />

            {/* Map Display Section */}
            {(!item.is_online || item.location_lat) && (
              <div className="mt-3">
                <label className="block text-sm mb-2 font-medium">Konum Haritası</label>
                <div className="mb-3">
                  <MapSelector
                    onLocationSelect={(lat, lng, address) => {
                      setItem({...item, location_lat: lat, location_lng: lng, location: address})
                    }}
                    initialLocation={
                      item.location_lat && item.location_lng
                        ? {
                            lat: item.location_lat,
                            lng: item.location_lng,
                            address: item.location
                          }
                        : undefined
                    }
                  />
                </div>

                {/* Map Provider Links */}
                {item.location_lat && item.location_lng && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                    <a
                      href={generateShortMapUrl(item.location_lat, item.location_lng, 'google')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      🗺️ Google Maps
                    </a>
                    <a
                      href={generateShortMapUrl(item.location_lat, item.location_lng, 'openstreetmap')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      🗺️ OpenStreetMap
                    </a>
                    <a
                      href={generateShortMapUrl(item.location_lat, item.location_lng, 'yandex')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      🗺️ Yandex Maps
                    </a>
                  </div>
                )}

                {/* Location Info */}
                {item.location_lat && item.location_lng && (
                  <div className="p-2 sm:p-3 bg-gray-50 border rounded">
                    <div className="text-sm">
                      <strong className="text-gray-700">📍 Koordinatlar:</strong>
                      <span className="ml-2 font-mono text-gray-600">
                        {item.location_lat.toFixed(6)}, {item.location_lng.toFixed(6)}
                      </span>
                    </div>
                    {item.location && (
                      <div className="text-xs sm:text-sm mt-1">
                        <strong className="text-gray-700">📍 Adres:</strong>
                        <span className="ml-2 text-gray-600">{item.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <button onClick={onSave} className="bg-primary-500 text-white px-3 py-2 rounded">Kaydet</button>
          {id !== 'new' && <button onClick={onDelete} className="bg-red-500 text-white px-3 py-2 rounded">Sil</button>}
          {id !== 'new' && (
            <Link to={`/events/${id}/guests`} className="bg-gray-700 text-white px-3 py-2 rounded">
              Davetlileri Yönet
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
