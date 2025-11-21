import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../shared/ui/Button';
import { useAuth } from '../../auth/context/AuthContext';
import { logger } from '../../../shared/utils/logger';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const log = logger.withContext('HomePage');

  return (
    <div className="content-wrapper">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animate-slide-up">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                Take Action for the Planet
              </h1>
              <p className="text-lg text-gray-700 max-w-prose">
                Join community-driven environmental initiatives. Discover local cleanups, tree plantings,
                and conservation efforts—and make a tangible impact.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/events" onClick={() => log.info('cta_browse_events')}>
                  <Button variant="primary" size="lg">Browse Events</Button>
                </Link>
                {isAuthenticated ? (
                  <Link to="/events/create" onClick={() => log.info('cta_create_event')}>
                    <Button variant="outline" size="lg">Create Event</Button>
                  </Link>
                ) : (
                  <Link to="/signup" onClick={() => log.info('cta_get_started')}>
                    <Button variant="outline" size="lg">Get Started</Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative w-full h-64 rounded-2xl bg-brand-600/10 border border-brand-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-32 h-32 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Why EarthForUs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mb-4">🌱</div>
            <h3 className="font-semibold mb-1">Meaningful Work</h3>
            <p className="text-gray-600">Find events that align with your values—make real-world impact.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mb-4">🤝</div>
            <h3 className="font-semibold mb-1">Community First</h3>
            <p className="text-gray-600">Connect with organizers and volunteers in your area.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mb-4">📅</div>
            <h3 className="font-semibold mb-1">Easy Scheduling</h3>
            <p className="text-gray-600">Browse and join events with a simple, clean interface.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
