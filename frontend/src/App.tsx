import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { BookmarksProvider } from './context/BookmarksContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { HomePage } from './pages/HomePage';
import { ConferencesPage } from './pages/ConferencesPage';
import { ConferenceDetailPage } from './pages/ConferenceDetailPage';
import { TrackDetailPage } from './pages/TrackDetailPage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SpeakersPage } from './pages/SpeakersPage';
import { SpeakerDetailPage } from './pages/SpeakerDetailPage';
import { SchedulePage } from './pages/SchedulePage';
import { MySchedulePage } from './pages/MySchedulePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ConferenceAdminPage } from './pages/admin/ConferenceAdminPage';
import { ConferenceFormPage } from './pages/admin/ConferenceFormPage';
import { SessionAdminPage } from './pages/admin/SessionAdminPage';
import { SessionFormPage } from './pages/admin/SessionFormPage';
import { SpeakerAdminPage } from './pages/admin/SpeakerAdminPage';
import { SpeakerFormPage } from './pages/admin/SpeakerFormPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BookmarksProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="conferences" element={<ConferencesPage />} />
              <Route path="conferences/:id" element={<ConferenceDetailPage />} />
              <Route path="conferences/:id/tracks/:trackId" element={<TrackDetailPage />} />
              <Route path="sessions/:id" element={<SessionDetailPage />} />
              <Route path="speakers" element={<SpeakersPage />} />
              <Route path="speakers/:id" element={<SpeakerDetailPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="my-schedule" element={
                <ProtectedRoute><MySchedulePage /></ProtectedRoute>
              } />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/conferences" replace />} />
                <Route path="conferences" element={<ConferenceAdminPage />} />
                <Route path="conferences/:id" element={<ConferenceFormPage />} />
                <Route path="sessions" element={<SessionAdminPage />} />
                <Route path="sessions/:id" element={<SessionFormPage />} />
                <Route path="speakers" element={<SpeakerAdminPage />} />
                <Route path="speakers/:id" element={<SpeakerFormPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </BookmarksProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthProvider>
  );
}
