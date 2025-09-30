import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DashboardLayout() {
  const location = useLocation()

  // Auto-close mobile sidebar when route changes
  useEffect(() => {
    const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay')
    if (mobileSidebarOverlay) {
      mobileSidebarOverlay.style.display = 'none'
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-herbalife-gradient-subtle">
      {/* Fixed sidebar on the left - hidden on mobile */}
      <div className="fixed left-0 top-0 h-full w-[var(--sidebar-width)] bg-white shadow-herbalife z-10 hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay - shown on mobile */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
        id="mobile-sidebar-overlay"
        style={{ display: 'none' }}
        onClick={(e) => {
          // Close sidebar when clicking on overlay
          if (e.target === e.currentTarget) {
            e.currentTarget.style.display = 'none';
          }
        }}
      >
        <div className="fixed left-0 top-0 h-full w-[var(--sidebar-width)] bg-white shadow-herbalife z-50 transform transition-transform duration-300">
          <Sidebar />
        </div>
      </div>

      {/* Main content area */}
      <div className="min-h-screen flex flex-col lg:ml-[var(--sidebar-width)]">
        <Header />
        <main className="flex-1 p-4 lg:p-8">
          <div className="bg-white rounded-xl shadow-herbalife p-4 lg:p-6 min-h-[calc(100vh-var(--header-height)-var(--footer-height)-4rem)]">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
