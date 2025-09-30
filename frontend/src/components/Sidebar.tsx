import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Dropdown, Avatar } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, DashboardOutlined, CalendarOutlined, UsergroupAddOutlined, BellOutlined, CrownOutlined, CloseOutlined } from '@ant-design/icons';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-herbalife-gradient text-white shadow-herbalife' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'}`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      onClick: logout,
    },
  ];

  const closeMobileSidebar = () => {
    const overlay = document.getElementById('mobile-sidebar-overlay')
    if (overlay) {
      overlay.style.display = 'none'
    }
  }

  return (
    <div className="flex flex-col h-full bg-white shadow-herbalife">
      <aside className="flex-1 overflow-y-auto">
        {/* Mobile close button */}
        <div className="p-4 lg:hidden flex justify-end">
          <button
            onClick={closeMobileSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <CloseOutlined className="text-gray-600 text-lg" />
          </button>
        </div>

        {/* Logo and Brand Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-herbalife-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Herbalife</h1>
              <p className="text-xs text-gray-500">Event Management</p>
            </div>
          </div>
          <nav className="space-y-2">
            <NavLink to="/" end className={linkClass}>
              <DashboardOutlined className="mr-3" />
              Dashboard
            </NavLink>
            <NavLink to="/events" className={linkClass}>
              <CalendarOutlined className="mr-3" />
              Etkinlikler
            </NavLink>
            <NavLink to="/guests" className={linkClass}>
              <UsergroupAddOutlined className="mr-3" />
              Davetliler
            </NavLink>
            <NavLink to="/notifications" className={linkClass}>
              <BellOutlined className="mr-3" />
              Bildirim Gönderimi
            </NavLink>
            {user?.role === 'superadmin' && (
              <NavLink to="/super-admin" className={linkClass}>
                <CrownOutlined className="mr-3" />
                Super Admin
              </NavLink>
            )}
          </nav>
        </div>
      </aside>
      
      {/* User profile section at the bottom */}
      {user && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="topRight">
            <div className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-white hover:shadow-sm transition-all duration-200">
              <Avatar 
                icon={<UserOutlined />} 
                className="bg-primary-500 text-white mr-3"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.role === 'superadmin' ? 'bg-secondary-500' : 'bg-primary-500'}`}></span>
                  {user.role}
                </p>
              </div>
            </div>
          </Dropdown>
        </div>
      )}
    </div>
  );
}
