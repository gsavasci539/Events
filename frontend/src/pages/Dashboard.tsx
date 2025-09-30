import React, { useEffect, useState } from 'react'
import { http } from '@/services/http'

type Stats = {
  events: number
  guests: number
  users: number
  notifications: number
  latest_notifications: { id: number; channel: string; recipient: string; status: string; sent_at: string; message?: string; event_title?: string|null }[]
  latest_activities: { 
    id: number; 
    action: string; 
    entity_type: string; 
    entity_id: number|null; 
    user_id: number|null; 
    user_name: string | null;
    detail?: string|null; 
    created_at: string 
  }[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Pagination states for notifications
  const [notificationsPagination, setNotificationsPagination] = useState({
    page: 1,
    perPage: 5,
    total: 0,
    totalPages: 1
  })

  // Pagination states for activities
  const [activitiesPagination, setActivitiesPagination] = useState({
    page: 1,
    perPage: 5,
    total: 0,
    totalPages: 1
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const { data } = await http.get<Stats>('/stats')
        console.log('Stats data:', data) // Debug log
        setStats(data)
        setError(null)

        // Initialize pagination counts
        if (data.latest_notifications) {
          setNotificationsPagination(prev => ({
            ...prev,
            total: data.latest_notifications.length,
            totalPages: Math.ceil(data.latest_notifications.length / prev.perPage)
          }))
        }

        if (data.latest_activities) {
          setActivitiesPagination(prev => ({
            ...prev,
            total: data.latest_activities.length,
            totalPages: Math.ceil(data.latest_activities.length / prev.perPage)
          }))
        }
      } catch (e: any) {
        console.error('Error fetching stats:', e) // Debug log
        setError(e?.response?.data?.detail || e?.message || 'İstatistikler yüklenemedi')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-full overflow-hidden">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-3 sm:p-4 rounded shadow">
              <div className="text-gray-600 text-xs sm:text-sm">Toplam Etkinlik</div>
              <div className="text-lg sm:text-2xl font-semibold text-green-600">{stats?.events ?? '0'}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded shadow">
              <div className="text-gray-600 text-xs sm:text-sm">Toplam Davetli</div>
              <div className="text-lg sm:text-2xl font-semibold text-green-600">{stats?.guests ?? '0'}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded shadow">
              <div className="text-gray-600 text-xs sm:text-sm">Toplam Kullanıcı</div>
              <div className="text-lg sm:text-2xl font-semibold text-green-600">{stats?.users ?? '0'}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded shadow">
              <div className="text-gray-600 text-xs sm:text-sm">Toplam Bildirim</div>
              <div className="text-lg sm:text-2xl font-semibold text-green-600">{stats?.notifications ?? '0'}</div>
            </div>
          </div>

          {/* Latest Notifications */}
          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <div className="font-medium mb-2 text-sm sm:text-base">Son Bildirimler</div>
            {stats?.latest_notifications?.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm min-w-[600px]">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[120px]">Etkinlik</th>
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[80px]">Kanal</th>
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[100px]">Alıcı</th>
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[80px]">Durum</th>
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[120px]">Tarih</th>
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[150px]">Mesaj</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.latest_notifications
                        .slice((notificationsPagination.page - 1) * notificationsPagination.perPage, notificationsPagination.page * notificationsPagination.perPage)
                        .map((n) => (
                          <tr key={n.id} className="border-t">
                            <td className="py-1 px-1 sm:py-1 sm:px-2 truncate max-w-[120px]" title={n.event_title || '-'}>{n.event_title || '-'}</td>
                            <td className="py-1 px-1 sm:py-1 sm:px-2">{n.channel}</td>
                            <td className="py-1 px-1 sm:py-1 sm:px-2 truncate max-w-[100px]" title={n.recipient}>{n.recipient}</td>
                            <td className="py-1 px-1 sm:py-1 sm:px-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                n.status === 'sent' ? 'bg-green-100 text-green-800' :
                                n.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {n.status}
                              </span>
                            </td>
                            <td className="py-1 px-1 sm:py-1 sm:px-2 text-xs">{new Date(n.sent_at).toLocaleString()}</td>
                            <td className="py-1 px-1 sm:py-1 sm:px-2 truncate max-w-[150px]" title={n.message || ''}>{n.message || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Notifications Pagination */}
                {notificationsPagination.totalPages > 1 && (
                  <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2">
                    <button
                      onClick={() => setNotificationsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={notificationsPagination.page <= 1}
                      className={`px-3 py-1 px-1 sm:py-1 sm:px-2 rounded border text-sm ${notificationsPagination.page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                    >
                      Önceki
                    </button>
                    <span className="text-xs text-gray-600">
                      Sayfa {notificationsPagination.page} / {notificationsPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setNotificationsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={notificationsPagination.page >= notificationsPagination.totalPages}
                      className={`px-3 py-1 px-1 sm:py-1 sm:px-2 rounded border text-sm ${notificationsPagination.page >= notificationsPagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                    >
                      Sonraki
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">Kayıt yok</div>
            )}
          </div>

          {/* Latest Activities */}
          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <div className="font-medium mb-2 text-sm sm:text-base">Son İşlemler</div>
            {stats?.latest_activities?.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm min-w-[700px]">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[100px]">İşlem</th>
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[80px]">Nesne</th>
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[80px]">Nesne ID</th>
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[100px]">Kullanıcı</th>
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[120px]">Tarih</th>
                        <th className="py-1 px-1 sm:py-1 sm:px-2 min-w-[150px]">Detay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.latest_activities
                        .slice((activitiesPagination.page - 1) * activitiesPagination.perPage, activitiesPagination.page * activitiesPagination.perPage)
                        .map((a) => (
                          <tr key={a.id} className="border-t">
                            <td className="py-1 px-1 sm:py-1 sm:px-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                a.action === 'create' ? 'bg-blue-100 text-blue-800' :
                                a.action === 'update' ? 'bg-yellow-100 text-yellow-800' :
                                a.action === 'delete' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {({ create: 'Oluşturma', update: 'Güncelleme', delete: 'Silme', notify: 'Bildirim' } as Record<string,string>)[a.action] || a.action}
                              </span>
                            </td>
                            <td className="py-1 px-1 sm:py-1 sm:px-2">{({ event: 'Etkinlik', guest: 'Davetli', notification: 'Bildirim' } as Record<string,string>)[a.entity_type] || a.entity_type}</td>
                            <td className="py-1 px-1 sm:py-1 sm:px-2">{a.entity_id ?? '-'}</td>
                            <td className="py-1 px-1 sm:py-1 sm:px-2 truncate max-w-[100px]" title={a.user_name || 'Sistem'}>{a.user_name || 'Sistem'}</td>
                            <td className="py-1 px-1 sm:py-1 sm:px-2 text-xs">{new Date(a.created_at).toLocaleString()}</td>
                            <td className="py-1 px-1 sm:py-1 sm:px-2 truncate max-w-[150px]" title={a.detail || ''}>{a.detail || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Activities Pagination */}
                {activitiesPagination.totalPages > 1 && (
                  <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2">
                    <button
                      onClick={() => setActivitiesPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={activitiesPagination.page <= 1}
                      className={`px-3 py-1 px-1 sm:py-1 sm:px-2 rounded border text-sm ${activitiesPagination.page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                    >
                      Önceki
                    </button>
                    <span className="text-xs text-gray-600">
                      Sayfa {activitiesPagination.page} / {activitiesPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setActivitiesPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={activitiesPagination.page >= activitiesPagination.totalPages}
                      className={`px-3 py-1 px-1 sm:py-1 sm:px-2 rounded border text-sm ${activitiesPagination.page >= activitiesPagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                    >
                      Sonraki
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">Kayıt yok</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
