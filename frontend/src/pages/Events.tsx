import { useEffect, useState } from 'react'
import { eventsService, Event } from '@/services/events'
import { Link, useNavigate } from 'react-router-dom'

export default function Events() {
  const [items, setItems] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 12,
    total: 0,
    totalPages: 1
  })
  const navigate = useNavigate()

  const loadEvents = async (page = 1) => {
    try {
      setLoading(true)
      const data = await eventsService.list(page, pagination.perPage)
      setItems(data.items)
      setPagination({
        ...pagination,
        page: data.page,
        total: data.total,
        totalPages: data.total_pages
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Etkinlikler</h1>
        <button onClick={()=>navigate('/events/new')} className="bg-primary-500 text-white px-3 py-2 rounded">Yeni Etkinlik</button>
      </div>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(ev => (
              <Link to={`/events/${ev.id}`} key={ev.id} className="bg-white p-4 rounded shadow hover:shadow-md">
                <div className="font-medium">{ev.title}</div>
                <div className="text-sm text-gray-500">{new Date(ev.start_time).toLocaleString()}</div>
                <div className="text-sm text-gray-600">{ev.location}</div>
              </Link>
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => loadEvents(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className={`px-4 py-2 rounded border ${pagination.page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
              >
                Önceki Sayfa
              </button>
              <span className="text-sm text-gray-600">
                Sayfa {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => loadEvents(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className={`px-4 py-2 rounded border ${pagination.page >= pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
              >
                Sonraki Sayfa
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
