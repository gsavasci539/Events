import { useEffect, useState } from 'react'
import { confirmDialog, successToast, errorToast } from '@/components/ConfirmDialog'
import { eventsService, type Event } from '@/services/events'
import { usersService, UserItem } from '@/services/users'
import { useAuth } from '@/store/auth'

export default function SuperAdmin() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventsPagination, setEventsPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 1
  })
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 1
  })

  const loadData = async (eventsPage = eventsPagination.page, usersPage = usersPagination.page) => {
    try {
      setError(null)
      setLoading(true)
      
      // Load events and users in parallel
      const [eventsResponse, usersResponse] = await Promise.all([
        eventsService.list(eventsPage, eventsPagination.perPage),
        usersService.list(usersPage, usersPagination.perPage),
      ])
      
      // Update events and pagination
      setEvents(eventsResponse.items)
      setEventsPagination({
        ...eventsPagination,
        page: eventsResponse.page,
        total: eventsResponse.total,
        totalPages: eventsResponse.total_pages
      })
      
      // Update users and pagination
      setUsers(usersResponse.items)
      setUsersPagination({
        ...usersPagination,
        page: usersResponse.page,
        total: usersResponse.total,
        totalPages: usersResponse.total_pages
      })
      
    } catch (e: any) {
      const errorMessage = e?.response?.data?.detail || e?.message || 'Yükleme hatası'
      setError(errorMessage)
      errorToast(`Veri yüklenirken hata oluştu: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEventsPageChange = (newPage: number) => {
    loadData(newPage, usersPagination.page)
  }

  const handleUsersPageChange = (newPage: number) => {
    loadData(eventsPagination.page, newPage)
  }

  const handleBlockUser = async (id: number) => {
    const confirmed = await confirmDialog('Bu kullanıcıyı engellemek istediğinize emin misiniz?')
    if (!confirmed) return
    try {
      await usersService.block(id)
      successToast('Kullanıcı başarıyla engellendi')
      loadData()
    } catch (e: any) {
      console.error('Block user error:', e)
      errorToast(e?.response?.data?.detail || e?.message || 'Kullanıcı engelleme hatası')
    }
  }

  const handleUnblockUser = async (id: number) => {
    const confirmed = await confirmDialog('Bu kullanıcının engelini kaldırmak istediğinize emin misiniz?')
    if (!confirmed) return
    try {
      await usersService.unblock(id)
      successToast('Kullanıcı engeli başarıyla kaldırıldı')
      loadData()
    } catch (e: any) {
      console.error('Unblock user error:', e)
      errorToast(e?.response?.data?.detail || e?.message || 'Kullanıcı engelini kaldırma hatası')
    }
  }

  const handleUnblockEvent = async (id: number) => {
    const confirmed = await confirmDialog('Bu etkinliğin engelini kaldırmak istediğinize emin misiniz?')
    if (!confirmed) return
    try {
      await eventsService.unblock(id)
      successToast('Etkinlik engeli başarıyla kaldırıldı')
      loadData()
    } catch (e: any) {
      console.error('Unblock error:', e)
      errorToast(e?.response?.data?.detail || e?.message || 'Engel kaldırma hatası')
    }
  }

  const handleBlockEvent = async (id: number) => {
    const confirmed = await confirmDialog('Bu etkinliği engellemek istediğinize emin misiniz?')
    if (!confirmed) return
    try {
      await eventsService.block(id)
      successToast('Etkinlik başarıyla engellendi')
      loadData()
    } catch (e: any) {
      console.error('Block error:', e)
      errorToast(e?.response?.data?.detail || e?.message || 'Engelleme hatası')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Super Admin Paneli</h1>
      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="space-y-6">
          {/* Users management */}
          <div className="bg-white rounded shadow overflow-auto">
            <div className="p-3 font-medium flex justify-between items-center">
              <span>Kullanıcılar</span>
              <div className="text-sm text-gray-600">
                Toplam {usersPagination.total} kullanıcı, sayfa {usersPagination.page}/{usersPagination.totalPages}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-3">ID</th>
                  <th className="px-3">Email</th>
                  <th className="px-3">Ad Soyad</th>
                  <th className="px-3">Rol</th>
                  <th className="px-3">Durum</th>
                  <th className="px-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="py-2 px-3">{u.id}</td>
                    <td className="px-3">
                      <input
                        className="border rounded px-2 py-1 w-56"
                        value={u.email}
                        disabled={u.id === user?.id}
                        onChange={(e)=>setUsers(prev=>prev.map(x=>x.id===u.id?{...x,email:e.target.value}:x))}
                      />
                    </td>
                    <td className="px-3">
                      <input
                        className="border rounded px-2 py-1 w-40"
                        value={u.full_name || ''}
                        onChange={(e)=>setUsers(prev=>prev.map(x=>x.id===u.id?{...x,full_name:e.target.value}:x))}
                      />
                    </td>
                    <td className="px-3">
                      <select
                        className="border rounded px-2 py-1"
                        value={u.role}
                        onChange={(e)=>setUsers(prev=>prev.map(x=>x.id===u.id?{...x,role:e.target.value as any}:x))}
                      >
                        <option value="distributor">distributor</option>
                        <option value="superadmin">superadmin</option>
                      </select>
                    </td>
                    <td className="px-3">{u.disabled ? 'Devre dışı' : 'Aktif'}</td>
                    <td className="px-3 space-x-2">
                      <button
                        className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                        onClick={async ()=>{
                          try{
                            const updated = await usersService.update(u.id, { email:u.email, full_name:u.full_name||undefined, role:u.role })
                            setUsers(prev=>prev.map(x=>x.id===u.id?{...x,...updated}:x))
                            successToast('Kullanıcı başarıyla güncellendi')
                          }catch(err:any){ 
                            errorToast(err?.response?.data?.detail || err?.message || 'Güncelleme hatası') 
                          }
                        }}
                      >Kaydet</button>
                      <button
                        className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                        onClick={async ()=>{
                          const confirmed = await confirmDialog('Bu kullanıcıyı silmek istediğinize emin misiniz?')
                          if(!confirmed) return
                          try{ 
                            await usersService.remove(u.id); 
                            setUsers(prev=>prev.filter(x=>x.id!==u.id))
                            successToast('Kullanıcı başarıyla silindi')
                          }catch(err:any){ 
                            errorToast(err?.response?.data?.detail || err?.message || 'Silme hatası') 
                          }
                        }}
                        disabled={u.id===user?.id}
                      >Sil</button>
                      {u.disabled ? (
                        <button
                          className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                          onClick={async ()=>{ 
                            try{ 
                              await usersService.enable(u.id); 
                              setUsers(prev=>prev.map(x=>x.id===u.id?{...x,disabled:false}:x))
                              successToast('Kullanıcı başarıyla etkinleştirildi')
                            }catch(err:any){ 
                              errorToast(err?.response?.data?.detail || err?.message || 'Etkinleştirme hatası') 
                            }
                          }}
                        >Etkinleştir</button>
                      ) : (
                        <button
                          className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                          onClick={async ()=>{ 
                            handleBlockUser(u.id)
                          }}
                          disabled={u.id===user?.id}
                        >Devre Dışı</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-3 flex justify-between items-center border-t">
              <div className="text-sm text-gray-600">
                Toplam {usersPagination.total} kullanıcı, sayfa {usersPagination.page}/{usersPagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUsersPageChange(usersPagination.page - 1)}
                  disabled={usersPagination.page <= 1}
                  className={`px-3 py-1 rounded border ${usersPagination.page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                >
                  Önceki
                </button>
                <button
                  onClick={() => handleUsersPageChange(usersPagination.page + 1)}
                  disabled={usersPagination.page >= usersPagination.totalPages}
                  className={`px-3 py-1 rounded border ${usersPagination.page >= usersPagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                >
                  Sonraki
                </button>
              </div>
            </div>
          </div>

          {/* Events overview with owner info */}
          <div className="bg-white rounded shadow overflow-auto">
            <div className="p-3 font-medium flex justify-between items-center">
              <span>Tüm Etkinlikler</span>
              <div className="text-sm text-gray-600">
                Toplam {eventsPagination.total} etkinlik, sayfa {eventsPagination.page}/{eventsPagination.totalPages}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-3">ID</th>
                  <th className="px-3">Başlık</th>
                  <th className="px-3">Sahip</th>
                  <th className="px-3">Başlangıç</th>
                  <th className="px-3">Durum</th>
                  <th className="px-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id} className="border-t">
                    <td className="py-2 px-3">{ev.id}</td>
                    <td className="px-3">{ev.title}</td>
                    <td className="px-3">{ev.owner_email || ev.owner_id || '-'}</td>
                    <td className="px-3">{new Date(ev.start_time).toLocaleString()}</td>
                    <td className="px-3">
                      {ev.is_blocked ? (
                        <span className="text-red-600 font-medium">Engellendi</span>
                      ) : (
                        <span className="text-green-600 font-medium">Aktif</span>
                      )}
                    </td>
                    <td className="px-3 space-x-2">
                      {ev.is_blocked ? (
                        <button
                          className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                          onClick={async () => {
                            handleUnblockEvent(ev.id)
                          }}
                        >
                          Engeli Kaldır
                        </button>
                      ) : (
                        <button
                          className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                          onClick={async () => {
                            handleBlockEvent(ev.id)
                          }}
                        >
                          Engelle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Events Pagination */}
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 flex flex-col sm:flex-row justify-between items-center border-t gap-2 sm:gap-0">
            <div className="text-sm text-gray-600">
              Toplam {eventsPagination.total} etkinlik, sayfa {eventsPagination.page}/{eventsPagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEventsPageChange(eventsPagination.page - 1)}
                disabled={eventsPagination.page <= 1}
                className={`px-3 py-1 rounded border ${eventsPagination.page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
              >
                Önceki
              </button>
              <button
                onClick={() => handleEventsPageChange(eventsPagination.page + 1)}
                disabled={eventsPagination.page >= eventsPagination.totalPages}
                className={`px-3 py-1 rounded border ${eventsPagination.page >= eventsPagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
