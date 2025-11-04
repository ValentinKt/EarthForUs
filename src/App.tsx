import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './app/layout/Layout';
import LandingPage from './features/landing/pages/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import CreateEventPage from './features/events/pages/CreateEventPage';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { AuthProvider } from './features/auth/context/AuthContext';
import ProtectedRoute from './features/auth/components/ProtectedRoute';

// Placeholder components for routes that haven't been created yet
const HomePage = () => <div className="content-wrapper"><h1 className="text-2xl font-bold">Home Page</h1></div>;
const UserDashboard = () => <div className="content-wrapper"><h1 className="text-2xl font-bold">User Dashboard</h1></div>;
const EventsPage = () => {
  const [list, setList] = useState<Array<{ id: number; title: string; location: string | null; start_time: string; end_time: string }>>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (res.ok) setList(data.events ?? []);
      } catch {
        // ignore for now
      }
    })();
  }, []);
  return (
    <div className="content-wrapper">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Events</h1>
        <a href="/events/create" className="text-brand-600 hover:text-brand-500">Create Event</a>
      </div>
      {list.length === 0 ? (
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
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
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
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
