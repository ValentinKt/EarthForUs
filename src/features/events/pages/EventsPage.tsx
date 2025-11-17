import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../shared/ui/Button';
import { api } from '../../../shared/utils/api';
import { useToast } from '../../../shared/components/Toast';
import { logger } from '../../../shared/utils/logger';

type EventItem = {
  id: number;
  title: string;
  location: string | null;
  start_time: string;
  end_time: string;
  description?: string | null;
};

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();
  const log = logger.withContext('EventsPage');

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      const grp = log.group('fetch_events');
      const tm = log.time('fetch');
      try {
        const data = await api.get<{ events: EventItem[] }>('/api/events');
        const list = data?.events ?? [];
        log.info('fetch_success', { count: list.length });
        setEvents(list);
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
    fetchEvents();
  }, []);

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discover Events</h1>
          <p className="text-gray-600">Find and join local environmental initiatives.</p>
        </div>
        <Link to="/events/create">
          <Button variant="primary">Create Event</Button>
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0,1,2].map(i => (
            <div key={i} className="h-40 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900 p-4 text-red-700 dark:text-red-300">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="earth" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && events.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No upcoming events</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Be the first to create one for your community.</p>
          <Link to="/events/create">
            <Button variant="primary">Create Event</Button>
          </Link>
        </div>
      )}

      {/* List */}
      {!isLoading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => (
            <div key={ev.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{ev.title}</h3>
                <span className="text-xs text-brand-700 bg-brand-100 px-2 py-1 rounded">{new Date(ev.start_time).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{ev.location || 'Location TBA'}</p>
              <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 19h14"/></svg>
                  <span>{new Date(ev.start_time).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7"/></svg>
                  <span>{new Date(ev.end_time).toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Link to={`/events/${ev.id}`}>
                  <Button variant="outline">Details</Button>
                </Link>
                <Button variant="earth">Join</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;