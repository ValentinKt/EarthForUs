import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './app/layout/Layout';
import LandingPage from './features/landing/pages/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import ErrorBoundary from './shared/components/ErrorBoundary';

// Placeholder components for routes that haven't been created yet
const HomePage = () => <div className="content-wrapper"><h1 className="text-2xl font-bold">Home Page</h1></div>;
const UserDashboard = () => <div className="content-wrapper"><h1 className="text-2xl font-bold">User Dashboard</h1></div>;
const EventsPage = () => <div className="content-wrapper"><h1 className="text-2xl font-bold">Events</h1></div>;
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
                <HomePage />
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
            <Route path="/profile" element={
              <Layout>
                <MyProfile />
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <Settings />
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
    </ErrorBoundary>
  );
}

export default App;
