import { useAuth } from '@/store/auth'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Input, Badge, Avatar, Dropdown, Popover } from 'antd'
import { SearchOutlined, BellOutlined, UserOutlined, SettingOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Get read status from localStorage on initial load
  const getInitialNotifications = () => {
    const defaultNotifications = [
      { id: 1, message: 'Yeni etkinlik oluşturuldu', read: false, timestamp: new Date() },
      { id: 2, message: 'Profil güncellendi', read: true, timestamp: new Date() },
      { id: 3, message: 'Sistem bakımı tamamlandı', read: false, timestamp: new Date() },
    ]
    
    try {
      const savedNotifications = localStorage.getItem('notifications')
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications)
        // Update read status from localStorage if available
        return defaultNotifications.map(notification => {
          const saved = parsed.find((n: any) => n.id === notification.id)
          return saved ? { ...notification, read: saved.read } : notification
        })
      }
    } catch (e) {
      console.error('Failed to load notifications from localStorage', e)
    }
    
    return defaultNotifications
  }
  
  const [notifications, setNotifications] = useState(getInitialNotifications)
  const unreadCount = notifications.filter(n => !n.read).length

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications))
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e)
    }
  }, [notifications])

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })))
  }

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleMobileSidebar = () => {
    const overlay = document.getElementById('mobile-sidebar-overlay')
    if (overlay) {
      overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none'
    }
  }

  const closeMobileSidebar = () => {
    const overlay = document.getElementById('mobile-sidebar-overlay')
    if (overlay) {
      overlay.style.display = 'none'
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      onClick: onLogout,
    },
  ]

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shadow-herbalife herbalife-card">
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        <MenuOutlined className="text-gray-600 text-lg" />
      </button>

      <div className="flex items-center flex-1 max-w-md lg:ml-0 ml-2">
        <div className="relative w-full">
          <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Arama yapın..."
            className="pl-10 pr-4 py-2 w-full border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            style={{ borderRadius: '8px' }}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative"
          >
            <Badge count={unreadCount} size="small">
              <BellOutlined className="text-xl text-gray-600" />
            </Badge>
          </button>
          
          {/* Notifications panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Bildirimler</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-xs text-primary-600 hover:text-primary-800"
                  >
                    Tümünü okundu olarak işaretle
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                <ul className="divide-y divide-gray-100">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <li 
                        key={notification.id} 
                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">
                              {notification.message}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {!notification.read && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Yeni
                            </span>
                          )}
                        </div>
                        </li>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Yeni bildiriminiz bulunmuyor
                    </div>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          open={dropdownVisible}
          onOpenChange={setDropdownVisible}
          getPopupContainer={(trigger) => trigger.parentElement || document.body}
          dropdownRender={(menu) => (
            <div className="ant-dropdown-menu" style={{ zIndex: 9999 }}>
              {menu}
            </div>
          )}
        >
          <div
            className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 select-none border border-transparent hover:border-primary-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownVisible(!dropdownVisible);
              console.log('User menu clicked, visible:', !dropdownVisible);
            }}
          >
            <Avatar
              icon={<UserOutlined />}
              className="bg-primary-500 text-white mr-3 herbalife-button-primary"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 hover:text-primary-600">
                {user?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user?.role === 'superadmin' ? 'bg-secondary-500' : 'bg-primary-500'}`}></span>
                {user?.role}
              </p>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  )
}
