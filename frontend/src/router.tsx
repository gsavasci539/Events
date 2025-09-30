import { createBrowserRouter } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load all page components
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const EventCreate = lazy(() => import('./pages/EventCreate'))
const Guests = lazy(() => import('./pages/Guests'))
const Notifications = lazy(() => import('./pages/Notifications'))
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-herbalife-green"></div>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    )
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Register />
      </Suspense>
    )
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Profile />
          </Suspense>
        )
      },
      {
        path: 'events',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Events />
          </Suspense>
        )
      },
      {
        path: 'events/new',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EventCreate />
          </Suspense>
        )
      },
      {
        path: 'events/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EventDetail />
          </Suspense>
        )
      },
      {
        path: 'events/:id/guests',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Guests />
          </Suspense>
        )
      },
      {
        path: 'guests',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Guests />
          </Suspense>
        )
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Notifications />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Settings />
          </Suspense>
        )
      },
      {
        path: 'super-admin',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SuperAdmin />
          </Suspense>
        )
      },
    ],
  },
])
