import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { authService } from './services/authService'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import FeedPage from './pages/feed/FeedPage'
import ProfilePage from './pages/profile/ProfilePage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import MessagesPage from './pages/messages/MessagesPage'
import SavedPostsPage from './pages/saved/SavedPostsPage'
import SearchPage from './pages/search/SearchPage'
import ReportManagement from './pages/admin/ReportManagement'
import ViewHistoryPage from './pages/history/ViewHistoryPage'
import Toast from './components/ui/Toast'
import Spinner from './components/ui/Spinner'

function AuthLayout() {
  const { user, isLoading } = useAuthStore()
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <AppShell />
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!user || user.role?.name !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    authService
      .getMe()
      .then((user) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [setUser, setLoading])

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />

        <Route element={<AuthLayout />}>
          <Route index element={<FeedPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/saved" element={<SavedPostsPage />} />
          <Route path="/history" element={<ViewHistoryPage />} />
          
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <ReportManagement />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast />
    </>
  )
}
