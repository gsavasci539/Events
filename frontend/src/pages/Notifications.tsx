import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { notificationsService } from '@/services/notifications'
import { eventsService, Event } from '@/services/events'
import { guestsService, Guest } from '@/services/guests'

export default function Notifications() {
  const { id } = useParams()
  const routeEventId = id ? Number(id) : undefined
  const [events, setEvents] = useState<Event[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const effectiveEventId = useMemo(() => routeEventId ?? (selectedId ? Number(selectedId) : undefined), [routeEventId, selectedId])

  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email')
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [results, setResults] = useState<{ guest_id: number|null; guest_name: string|null; recipient: string; ok: boolean; status: string; log_id: number }[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuestId, setSelectedGuestId] = useState<number | ''>('')
  const [eventDetail, setEventDetail] = useState<Event | null>(null)
  const [sendAll, setSendAll] = useState(false)
  const [retrying, setRetrying] = useState<Record<string, boolean>>({})

  // Results pagination
  const [resultsPagination, setResultsPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 1
  })

  useEffect(() => {
    if (results) {
      setResultsPagination(prev => ({
        ...prev,
        total: results.length,
        totalPages: Math.ceil(results.length / prev.perPage),
        page: 1 // Reset to first page when results change
      }))
    }
  }, [results])

  const errorToString = (val: any): string => {
    if (!val) return 'Bilinmeyen hata'
    if (typeof val === 'string') return val
    if (Array.isArray(val)) {
      const parts = val.map((e) => (e?.msg ? String(e.msg) : JSON.stringify(e))).filter(Boolean)
      return parts.join(', ')
    }
    if (typeof val === 'object') {
      if (val.detail) return errorToString(val.detail)
      try { return JSON.stringify(val) } catch { return String(val) }
    }
    return String(val)
  }

  // Load events list if not on /events/:id/notifications
  useEffect(() => {
    if (routeEventId) return
    ;(async () => {
      const data = await eventsService.list(1, 100) // Load first 100 events
      setEvents(data.items)
    })()
  }, [routeEventId])

  // Load guests when event changes
  useEffect(() => {
    (async () => {
      if (!effectiveEventId) { setGuests([]); return }
      const list = await guestsService.listAllByEvent(effectiveEventId)
      setGuests(list)
    })()
  }, [effectiveEventId])

  // Load event detail when event changes (for preview)
  useEffect(() => {
    (async () => {
      if (!effectiveEventId) { setEventDetail(null); return }
      const detail = await eventsService.detail(effectiveEventId)
      setEventDetail(detail)
    })()
  }, [effectiveEventId])

  // Keep recipient in sync if channel changes and a guest is selected
  useEffect(() => {
    if (!selectedGuestId || sendAll) return
    const g = guests.find(x => x.id === Number(selectedGuestId))
    if (!g) return
    setRecipient(channel === 'email' ? (g.email || '') : (g.phone || ''))
  }, [channel])

  const onSend = async () => {
    setStatus(null)
    setError(null)
    if (!effectiveEventId) { setError('Lütfen etkinlik seçiniz'); return }
    try {
      const res = await notificationsService.send({ event_id: Number(effectiveEventId), channel, recipient: recipient || undefined, message })
      setStatus(res.status)
      setResults(res.results ?? null)
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? 'Gönderim başarısız'
      setError(errorToString(msg))
      // Even on network error, show a synthesized results table so the user sees what would be targeted
      const statusText = typeof msg === 'string' ? msg : 'Network Error'
      if (recipient) {
        const g = guests.find(x => (channel === 'email' ? x.email : x.phone) === recipient)
        const row = {
          guest_id: g?.id ?? null,
          guest_name: g?.name ?? null,
          recipient: recipient,
          ok: false,
          status: statusText,
          log_id: -1,
        }
        setResults([row])
      } else {
        // Broadcast mode: build rows for guests (prefer those with contact info for selected channel)
        const rows = (guests.length ? guests : []).map(g => ({
          guest_id: g.id,
          guest_name: g.name,
          recipient: channel === 'email' ? (g.email || '-') : (g.phone || '-'),
          ok: false,
          status: statusText,
          log_id: -1,
        }))
        setResults(rows)
      }
    }
  }

  const retryOne = async (rec: string) => {
    if (!effectiveEventId) return
    try {
      setRetrying((m) => ({ ...m, [rec]: true }))
      const res = await notificationsService.send({ event_id: Number(effectiveEventId), channel, recipient: rec, message })
      setStatus(res.status)
      // Update results row with new status
      setResults((prev) => {
        if (!prev) return prev
        return prev.map((r) => r.recipient === rec ? { ...r, ok: !!res.ok, status: res.status, log_id: res.log_id ?? r.log_id } : r)
      })
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? 'Gönderim başarısız'
      setError(errorToString(msg))
      setResults((prev) => {
        if (!prev) return prev
        return prev.map((r) => r.recipient === rec ? { ...r, ok: false, status: typeof msg === 'string' ? msg : 'Network Error' } : r)
      })
    } finally {
      setRetrying((m) => ({ ...m, [rec]: false }))
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Bildirim Gönderimi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: form & preview */}
        <div className="bg-white p-4 rounded shadow space-y-3">
        {!routeEventId && (
          <div>
            <label className="block text-sm mb-1">Etkinlik Seç</label>
            <select className="w-full border rounded px-3 py-2" value={selectedId} onChange={e=>setSelectedId(e.target.value? Number(e.target.value) : '')}>
              <option value="">Seçiniz</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title} (#{ev.id})</option>
              ))}
            </select>
          </div>
        )}
        {/* Broadcast toggle */}
        <div className="flex items-center gap-2">
          <input id="sendAll" type="checkbox" checked={sendAll} onChange={(e)=>{
            const v = e.target.checked
            setSendAll(v)
            if (v) { setSelectedGuestId(''); setRecipient('') }
          }} />
          <label htmlFor="sendAll" className="text-sm">Tüm davetlilere gönder</label>
        </div>
        {effectiveEventId && guests.length > 0 && (
          <div>
            <label className="block text-sm mb-1">Davetli Seç (isteğe bağlı)</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedGuestId}
              disabled={sendAll}
              onChange={(e) => {
                const val = e.target.value
                if (!val) {
                  setSelectedGuestId('')
                  setRecipient('') // empty recipient => broadcast
                  return
                }
                const idNum = Number(val)
                setSelectedGuestId(idNum)
                setSendAll(false)
                const g = guests.find(x => x.id === idNum)
                if (!g) { setRecipient(''); return }
                // Fill recipient based on channel
                setRecipient(channel === 'email' ? (g.email || '') : (g.phone || ''))
              }}
            >
              <option value="">Seçiniz</option>
              {guests.map(g => (
                <option key={g.id} value={g.id}>{g.name} {g.email ? `- ${g.email}` : g.phone ? `- ${g.phone}` : ''}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Kanal</label>
          <select value={channel} onChange={e=>setChannel(e.target.value as any)} className="w-full border rounded px-3 py-2">
            <option value="email">E-posta</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Alıcı</label>
          <input value={recipient} onChange={e=>{ setRecipient(e.target.value); if (e.target.value) setSendAll(false) }} className="w-full border rounded px-3 py-2" disabled={sendAll} />
        </div>
        <div>
          <label className="block text-sm mb-1">Mesaj</label>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        {/* Preview */}
        <div className="border rounded p-2 sm:p-3 bg-gray-50">
          <div className="font-medium mb-2">Önizleme</div>
          {effectiveEventId && eventDetail ? (
            <div className="space-y-2 text-sm text-gray-800">
              {recipient ? (
                <div className="whitespace-pre-wrap">{
                  `Merhaba ${guests.find(g => (channel === 'email' ? g.email : g.phone) === recipient)?.name || 'Misafir'}, '${eventDetail.title}' etkinliği hakkında bilgi: Konum: ${eventDetail.location || '-'}, Başlangıç: ${new Date(eventDetail.start_time).toLocaleString()}.
${!eventDetail.is_online && eventDetail.location_lat && eventDetail.location_lng ? `Harita: https://www.google.com/maps?q=${eventDetail.location_lat},${eventDetail.location_lng}` : ''}
${eventDetail.is_online && eventDetail.online_link ? `Çevrimiçi Katılım: ${eventDetail.online_link}` : ''}
${message}`
                }</div>
              ) : (
                <div className="space-y-2">
                  {(guests.slice(0, 3)).map((g) => (
                    <div key={g.id} className="whitespace-pre-wrap">{
                      `Merhaba ${g.name}, '${eventDetail.title}' etkinliği hakkında bilgi: Konum: ${eventDetail.location || '-'}, Başlangıç: ${new Date(eventDetail.start_time).toLocaleString()}.
${!eventDetail.is_online && eventDetail.location_lat && eventDetail.location_lng ? `Harita: https://www.google.com/maps?q=${eventDetail.location_lat},${eventDetail.location_lng}` : ''}
${eventDetail.is_online && eventDetail.online_link ? `Çevrimiçi Katılım: ${eventDetail.online_link}` : ''}
${message}`
                    }</div>
                  ))}
                  {guests.length > 3 && (
                    <div className="text-gray-500">... ve {guests.length - 3} kişi daha</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Etkinlik seçiniz. Mesaj önizlemesi burada görünecek.</div>
          )}
        </div>
        <button onClick={onSend} className="bg-primary-500 text-white px-3 py-2 rounded w-full">Gönder</button>
        {status && <div className="text-sm text-gray-600">Durum: {status}</div>}
        {error && <div className="text-sm text-red-600">Hata: {error}</div>}
        </div>
        {/* Right: results table */}
        <div className="bg-white p-4 rounded shadow">
          <div className="font-medium mb-2">Gönderim Sonuçları</div>
          {results && results.length > 0 ? (
            <>
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1">Davetli</th>
                    <th>Alıcı</th>
                    <th>Durum</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {results
                    .slice((resultsPagination.page - 1) * resultsPagination.perPage, resultsPagination.page * resultsPagination.perPage)
                    .map((r, idx) => (
                      <tr key={r.log_id || r.recipient || idx} className="border-t">
                        <td className="py-1">{r.guest_name || '-'}</td>
                        <td>{r.recipient}</td>
                        <td>{r.ok ? 'Başarılı' : `Başarısız (${r.status})`}</td>
                        <td>
                          <button
                            className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-60 w-full"
                            disabled={!effectiveEventId || retrying[r.recipient]}
                            onClick={() => retryOne(r.recipient)}
                          >
                            {retrying[r.recipient] ? 'Tekrar gönderiliyor...' : 'Yeniden Gönder'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* Results Pagination */}
              {resultsPagination.totalPages > 1 && (
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                  <button
                    onClick={() => setResultsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={resultsPagination.page <= 1}
                    className={`px-3 py-1 rounded border text-sm ${resultsPagination.page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                  >
                    Önceki
                  </button>
                  <span className="text-xs text-gray-600">
                    Sayfa {resultsPagination.page} / {resultsPagination.totalPages} (Toplam {resultsPagination.total})
                  </span>
                  <button
                    onClick={() => setResultsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={resultsPagination.page >= resultsPagination.totalPages}
                    className={`px-3 py-1 rounded border text-sm ${resultsPagination.page >= resultsPagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500">Henüz sonuç yok. Gönderim sonrası burada listelenecek.</div>
          )}
        </div>
      </div>
    </div>
  )
}
