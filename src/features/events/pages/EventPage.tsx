import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../../shared/ui/Button';
import { useToast } from '../../../shared/components/Toast';
import { logger } from '../../../shared/utils/logger';
import { api } from '../../../shared/utils/api';

type EventDetail = {
  id: number;
  title: string;
  description?: string | null;
  location?: string | null;
  start_time: string;
  end_time: string;
  capacity?: number | null;
};

const tabs = [
  { id: 'about', label: 'About' },
  { id: 'updates', label: 'Updates' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'chat', label: 'Chat' },
];

const EventPage: React.FC = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('about');
  const { error: showError } = useToast();
  const log = logger.withContext('EventPage');

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      const grp = log.group('fetch_event');
      const tm = log.time('fetch');
      try {
        const data = await api.get<EventDetail>(`/api/events/${id}`);
        setEvent(data);
        log.info('fetch_success', { id });
      } catch (e) {
        const msg = (e as Error)?.message || 'Failed to load event';
        log.error('fetch_error', { message: msg, id });
        setError(msg);
        showError(msg, 'Event Load Error');
      } finally {
        tm.end();
        grp.end();
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const metaItem = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      {icon}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="content-wrapper">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 border-b border-gray-200">
        <Link to="/events" className="text-gray-700 flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span>Back to events</span>
        </Link>
        <h1 className="text-lg font-bold tracking-tight">Event Details</h1>
        <div className="flex items-center gap-2">
          <Button variant="earth">Join</Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded mb-4" />
          <div className="h-5 w-1/3 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="h-40 bg-gray-200 animate-pulse rounded" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="earth" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{event?.title || 'Untitled Event'}</h2>
            <div className="mt-2 flex flex-wrap gap-4">
              {metaItem(
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 19h14"/></svg>,
                new Date(event?.start_time || Date.now()).toLocaleString()
              )}
              {metaItem(
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7"/></svg>,
                new Date(event?.end_time || Date.now()).toLocaleString()
              )}
              {metaItem(
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414m0 0L9.172 8.172m4.242 4.242l4.243 4.243M9.172 8.172l4.243 4.243"/></svg>,
                event?.location || 'Location TBA'
              )}
              {typeof event?.capacity === 'number' && metaItem(
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M18 8a3 3 0 11-6 0 3 3 0 016 0zM6 8a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
                `${event.capacity} volunteers`
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap gap-2" aria-label="Event sections">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 border-b-2 ${activeTab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'} transition-colors`}
                  aria-current={activeTab === t.id ? 'page' : undefined}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'about' && (
              <div className="prose max-w-none">
                <p className="text-gray-700">{event?.description || 'No description provided for this event yet.'}</p>
              </div>
            )}
            {activeTab === 'updates' && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-700">
                <p>No updates yet. Organizers can post plans and progress here.</p>
              </div>
            )}
            {activeTab === 'checklist' && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Bring reusable water bottle</li>
                  <li>Wear gloves and comfortable shoes</li>
                  <li>Check local weather before heading out</li>
                </ul>
              </div>
            )}
            {activeTab === 'chat' && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-700">
                <p>Chat will be available soon. Join to be notified.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPage;