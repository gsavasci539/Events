import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { guestsService, Guest, GuestCreate } from '@/services/guests'
import { eventsService, Event } from '@/services/events'
import { confirmDialog, successToast, errorToast } from '@/components/ConfirmDialog'
import GuestEditModal from '@/components/GuestEditModal'

export default function Guests() {
  const [items, setItems] = useState<Guest[]>([])
  const { id } = useParams()
  const eventId = id ? Number(id) : undefined
  const [events, setEvents] = useState<Event[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [form, setForm] = useState<GuestCreate & { id?: number }>({ name: '', email: '', phone: '', event_id: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 1
  })

  const effectiveEventId = useMemo(() => eventId ?? (selectedId ? Number(selectedId) : undefined), [eventId, selectedId])

  const errorToString = (val: any): string => {
    if (!val) return 'Bilinmeyen hata'
    if (typeof val === 'string') return val
    if (Array.isArray(val)) {
      // FastAPI validation errors array
      const parts = val.map((e) => (e?.msg ? String(e.msg) : JSON.stringify(e))).filter(Boolean)
      return parts.join(', ')
    }
    if (typeof val === 'object') {
      if (val.detail) return errorToString(val.detail)
      try { return JSON.stringify(val) } catch { return String(val) }
    }
    return String(val)
  }

  const loadGuests = async (page = 1) => {
    if (!effectiveEventId) return
    try {
      setLoading(true)
      const data = await guestsService.listByEvent(effectiveEventId, page, pagination.perPage)
      setItems(data.items)
      setPagination({
        ...pagination,
        page: data.page,
        total: data.total,
        totalPages: data.total_pages
      })
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? 'Davetliler yüklenemedi'
      errorToast(errorToString(msg))
    } finally {
      setLoading(false)
    }
  }

  // Load events only if we don't have an eventId from the route
  useEffect(() => {
    if (eventId) return
    ;(async () => {
      const data = await eventsService.list(1, 100) // Load first 100 events
      setEvents(data.items)
    })()
  }, [eventId])

  useEffect(() => {
    loadGuests()
  }, [effectiveEventId])

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', event_id: effectiveEventId || 0 })
  }

  const handleEditGuest = async (id: number, data: { name: string; email?: string; phone?: string }) => {
    try {
      await guestsService.update(id, data)
      successToast('Davetli başarıyla güncellendi')
      if (effectiveEventId) {
        const data = await guestsService.listByEvent(effectiveEventId, pagination.page, pagination.perPage)
        setItems(data.items)
        setPagination({
          ...pagination,
          total: data.total,
          totalPages: data.total_pages
        })
      }
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? 'Güncelleme başarısız'
      throw new Error(errorToString(msg))
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDialog('Bu davetliyi silmek istediğinize emin misiniz?')
    if (!confirmed) return
    
    try {
      await guestsService.remove(id)
      if (effectiveEventId) {
        const data = await guestsService.listByEvent(effectiveEventId, pagination.page, pagination.perPage)
        setItems(data.items)
        setPagination({
          ...pagination,
          total: data.total,
          totalPages: data.total_pages
        })
      }
      successToast('Davetli başarıyla silindi')
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? 'Silme işlemi başarısız'
      errorToast(errorToString(msg))
    }
  }

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest)
  }

  const handleSubmit = async () => {
    try {
      setError(null)
      setSaving(true)
      if (!effectiveEventId) return

      const payload = { ...form, event_id: effectiveEventId }

      // Create new guest
      await guestsService.create(payload)
      successToast('Davetli başarıyla eklendi')

      // Refresh list
      const data = await guestsService.listByEvent(effectiveEventId, pagination.page, pagination.perPage)
      setItems(data.items)
      setPagination({
        ...pagination,
        total: data.total,
        totalPages: data.total_pages
      })
      resetForm()
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? 'İşlem başarısız'
      setError(errorToString(msg))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Yeni Davetli Ekle
      </h1>
      {!eventId && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <label className="block text-sm mb-1">Etkinlik Seç</label>
          <select
            className="border rounded px-3 py-2 w-full md:w-80"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Seçiniz</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title} (#{ev.id})</option>
            ))}
          </select>
        </div>
      )}
      <div className="bg-white p-4 rounded shadow">
        {/* Event ID comes from route param; no manual input */}
        {/* Guest form */}
        <div className="border rounded p-4 mb-6 bg-white shadow-sm">
          {error && <div className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ad Soyad *</label>
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Ad Soyad"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">E-posta</label>
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="E-posta (opsiyonel)"
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Telefon</label>
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Telefon (opsiyonel)"
                type="tel"
                value={form.phone || ''}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <button
                className="bg-primary-500 hover:bg-primary-600 text-white rounded px-3 sm:px-4 py-2 w-full h-[42px] disabled:opacity-50"
                disabled={!effectiveEventId || !form.name || saving}
                onClick={handleSubmit}
              >
                {saving 
                  ? 'Kaydediliyor...' 
                  : form.id ? 'Güncelle' : 'Ekle'}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="ml-1 sm:ml-2 text-gray-500 hover:text-gray-700 h-[42px] px-2 sm:px-3"
                  title="İptal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className="ml-2">Yükleniyor...</span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        Henüz davetli eklenmemiş
                      </td>
                    </tr>
                  ) : (
                    items.map((g) => (
                      <tr key={g.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{g.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {g.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {g.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(g)}
                            className="text-indigo-600 hover:text-indigo-900 mr-2 sm:mr-4"
                            title="Düzenle"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(g.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center bg-white p-3 sm:p-4 rounded shadow gap-2 sm:gap-0">
          <button
            onClick={() => loadGuests(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className={`px-4 py-2 rounded border ${pagination.page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
          >
            Önceki Sayfa
          </button>
          <span className="text-sm text-gray-600">
            Sayfa {pagination.page} / {pagination.totalPages} (Toplam {pagination.total} davetli)
          </span>
          <button
            onClick={() => loadGuests(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className={`px-4 py-2 rounded border ${pagination.page >= pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
          >
            Sonraki Sayfa
          </button>
        </div>
      )}

      {/* Edit Guest Modal */}
      <GuestEditModal
        isOpen={!!editingGuest}
        onClose={() => setEditingGuest(null)}
        guest={editingGuest}
        onSave={handleEditGuest}
      />
    </div>
  )
}
