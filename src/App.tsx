import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './app/layout/Layout';
import LandingPage from './features/landing/pages/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import CreateEventPage from './features/events/pages/CreateEventPage';
import HomePage from './features/home/pages/HomePage';
import EventsPage from './features/events/pages/EventsPage';
import EventPage from './features/events/pages/EventPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { AuthProvider } from './features/auth/context/AuthContext';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { ToastProvider } from './shared/components/Toast';
import { logger } from './shared/utils/logger';
import SettingsPage from './features/settings/pages/SettingsPage';

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
            <Route path="/events" element={
              <Layout>
                <EventsPage />
              </Layout>
            } />
            <Route path="/events/:id" element={
              <Layout>
                <EventPage />
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
                  <ProfilePage />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <ProtectedRoute>
                  <SettingsPage />
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
