import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminLayout } from '@/components/layout/admin-layout'
import { LoginPage } from '@/pages/login'
import { DashboardPage } from '@/pages/dashboard'
import { EventsPage } from '@/pages/events'
import { UsersPage } from '@/pages/users'
import { GuestsPage } from '@/pages/guests'
import { RsvpAnalyticsPage } from '@/pages/rsvp-analytics'
import { CategoriesPage } from '@/pages/categories'
import { ThemesPage } from '@/pages/themes'
import { NotificationsPage } from '@/pages/notifications'
import { ArchivedEventsPage } from '@/pages/archived-events'
import { ReportsPage } from '@/pages/reports'
import { SettingsPage } from '@/pages/settings'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="guests" element={<GuestsPage />} />
              <Route path="rsvp-analytics" element={<RsvpAnalyticsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="themes" element={<ThemesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="archived" element={<ArchivedEventsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
