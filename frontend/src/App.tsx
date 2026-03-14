import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ConferencesPage } from './pages/ConferencesPage';
import { ConferenceDetailPage } from './pages/ConferenceDetailPage';
import { TrackDetailPage } from './pages/TrackDetailPage';
import { LoginPage } from './pages/LoginPage';
import { SpeakersPage } from './pages/SpeakersPage';
import { SchedulePage } from './pages/SchedulePage';
import { NotFoundPage } from './pages/NotFoundPage';

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="conferences" element={<ConferencesPage />} />
            <Route path="conferences/:id" element={<ConferenceDetailPage />} />
            <Route path="conferences/:id/tracks/:trackId" element={<TrackDetailPage />} />
            <Route path="speakers" element={<SpeakersPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
