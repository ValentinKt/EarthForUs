import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Layout from './app/layout/Layout';
import LandingPage from './features/landing/pages/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import CreateEventPage from './features/events/pages/CreateEventPage';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { AuthProvider } from './features/auth/context/AuthContext';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { ToastProvider } from './shared/components/Toast';
import { logger } from './shared/utils/logger';
import { api } from './shared/utils/api';
import { useToast } from './shared/components/Toast';

// Placeholder components for routes that haven't been created yet
const HomePage = () => <div className="content-wrapper"><h1 className="text-2xl font-bold">Home Page</h1></div>;
const UserDashboard = () => <div className="content-wrapper"><h1 className="text-2xl font-bold">User Dashboard</h1></div>;
const EventsPage = () => {
  const [list, setList] = useState<Array<{ id: number; title: string; location: string | null; start_time: string; end_time: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();
  const log = logger.withContext('EventsPage');
  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    const grp = log.group('fetch_events');
    const tm = log.time('fetch');
    log.info('fetch_start');
    try {
      const data = await api.get<{ events: Array<{ id: number; title: string; location: string | null; start_time: string; end_time: string }> }>('/api/events');
      log.info('fetch_success', { count: (data?.events ?? []).length });
      setList(data?.events ?? []);
    } catch (e) {
      const msg = (e as Error)?.message || 'Failed to load events';
      log.error('fetch_error', { message: msg });
      setError(msg);
      showError(msg, 'Events Load Error');
    } finally {
      tm.end();
      grp.end();
      setIsLoading(false);
    }
  };
  useEffect(() => { fetchEvents(); }, []);
  return (
    <div className="content-wrapper">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link to="/events/create" className="px-3 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400">
          Create Event
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 dark:bg-red-900/30 p-3 text-red-700 dark:text-red-300">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => { log.info('retry_click'); fetchEvents(); }}
              className="ml-4 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500"
            >
              Retry
            </button>
          </div>
        </div>
      ) : list.length === 0 ? (
        <p className="text-gray-600">No events yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead>
              <tr className="text-left">
                <th className="p-2 border-b">Title</th>
                <th className="p-2 border-b">Location</th>
                <th className="p-2 border-b">Start</th>
                <th className="p-2 border-b">End</th>
              </tr>
            </thead>
            <tbody>
              {list.map(ev => (
                <tr key={ev.id}>
                  <td className="p-2 border-b">{ev.title}</td>
                  <td className="p-2 border-b">{ev.location ?? '-'}</td>
                  <td className="p-2 border-b">{new Date(ev.start_time).toLocaleString()}</td>
                  <td className="p-2 border-b">{new Date(ev.end_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
const MyProfile = () => <div className="content-wrapper"><h1 className="text-2xl font-bold">My Profile</h1></div>;
const Settings = () => <div className="content-wrapper"><h1 className="text-2xl font-bold">Settings</h1></div>;
const NotFound = () => (
  <div className="content-wrapper text-center py-20">
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
    <p className="text-gray-600 dark:text-gray-400">Page not found</p>
  </div>
);

function App() {
  const RouteLogger = () => {
    const location = useLocation();
    const log = logger.withContext('AppRoute');
    useEffect(() => {
      log.info('route_change', { path: location.pathname });
    }, [location.pathname]);
    return null;
  };
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
        <Router>
        <RouteLogger />
        <div className="App">
          <Routes>
            {/* Public routes without layout */}
            <Route path="/" element={
              <Layout showHeader={true} showFooter={true}>
                <LandingPage />
              </Layout>
            } />
            
            {/* Auth routes without header/footer */}
            <Route path="/login" element={
              <Layout showHeader={false} showFooter={false}>
                <LoginPage />
              </Layout>
            } />
            <Route path="/signup" element={
              <Layout showHeader={false} showFooter={false}>
                <SignupPage />
              </Layout>
            } />

            {/* Protected routes with full layout */}
            <Route path="/home" element={
              <Layout>
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/dashboard" element={
              <Layout>
                <UserDashboard />
              </Layout>
            } />
            <Route path="/events" element={
              <Layout>
                <EventsPage />
              </Layout>
            } />
            <Route path="/events/create" element={
              <Layout>
                <ProtectedRoute>
                  <CreateEventPage />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/profile" element={
              <Layout>
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              </Layout>
            } />

            {/* Redirects */}
            <Route path="/dashboard" element={<Navigate to="/home" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={
              <Layout>
                <NotFound />
              </Layout>
            } />
          </Routes>
        </div>
      </Router>
      </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
