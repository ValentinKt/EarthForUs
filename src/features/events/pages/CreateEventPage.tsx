import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '../../../shared/ui/Button';
import TextField from '../../../shared/components/TextField';
import Textarea from '../../../shared/components/Textarea';
import DateTimeField from '../../../shared/components/DateTimeField';
import NumberField from '../../../shared/components/NumberField';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../../shared/utils/logger';
import { useToast } from '../../../shared/components/Toast';
import { useAuth } from '../../auth/context/AuthContext';
import EventMap from '../components/EventMap';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const log = logger.withContext('CreateEventPage');
  const { success: showSuccess, error: showError } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    capacity: 10,
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number>(500);
  const [tools, setTools] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [hasValidationError, setHasValidationError] = useState(false);
  const [formErrors, setFormErrors] = useState<{ title?: string; start_time?: string; end_time?: string; capacity?: string }>({});
  const [successBanner, setSuccessBanner] = useState(false);

  useEffect(() => {
    const dirty = Boolean(
      form.title || form.description || form.location || form.start_time || form.end_time ||
      tools.length > 0 || form.capacity !== 10
    );
    setIsDirty(dirty);
  }, [form, tools]);

  useEffect(() => {
    if (form.start_time && form.end_time) {
      const invalid = new Date(form.end_time) <= new Date(form.start_time);
      setHasValidationError(invalid);
    } else {
      setHasValidationError(false);
    }
  }, [form.start_time, form.end_time]);

  useEffect(() => {
    const handler = (e: any) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    log.debug('field_change', { name, value });
    setForm(prev => ({ ...prev, [name]: name === 'capacity' ? Number(value) : value }));
  };

  // Inline validation
  useEffect(() => {
    const errs: { title?: string; start_time?: string; end_time?: string; capacity?: string } = {};
    if (!form.title.trim()) {
      errs.title = 'Title is required';
    } else if (form.title.trim().length > 200) {
      errs.title = 'Title is too long (max 200 characters)';
    }
    if (!form.start_time) {
      errs.start_time = 'Start time is required';
    } else if (Number.isNaN(new Date(form.start_time).getTime())) {
      errs.start_time = 'Invalid start time';
    }
    if (!form.end_time) {
      errs.end_time = 'End time is required';
    } else if (Number.isNaN(new Date(form.end_time).getTime())) {
      errs.end_time = 'Invalid end time';
    } else if (form.start_time && new Date(form.end_time) <= new Date(form.start_time)) {
      errs.end_time = 'End time must be after start time';
    }
    if (!Number.isFinite(form.capacity) || form.capacity <= 0) {
      errs.capacity = 'Capacity must be a positive number';
    }
    setFormErrors(errs);
    setHasValidationError(Object.keys(errs).length > 0);
  }, [form.title, form.start_time, form.end_time, form.capacity]);

  const incrementCapacity = () => setForm(prev => {
    const next = prev.capacity + 1;
    log.info('capacity_increment', { from: prev.capacity, to: next });
    return { ...prev, capacity: next };
  });
  const decrementCapacity = () => setForm(prev => {
    const next = Math.max(1, prev.capacity - 1);
    log.info('capacity_decrement', { from: prev.capacity, to: next });
    return { ...prev, capacity: next };
  });

  const onAddTool = () => {
    const t = toolInput.trim();
    if (!t) return;
    log.info('tool_added', { tool: t });
    setTools(prev => [...prev, t]);
    setToolInput('');
  };
  const removeTool = (idx: number) => {
    const removed = tools[idx];
    log.info('tool_removed', { index: idx, tool: removed });
    setTools(prev => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasValidationError) {
      log.warn('submit_blocked_due_to_validation');
      return;
    }
    if (!user?.id) {
      const msg = 'Please log in to create an event';
      setError(msg);
      showError(msg, 'Create Event Failed');
      return;
    }
    setIsLoading(true);
    const grp = log.group('Create Event Submit');
    const tm = log.time('submit');
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        capacity: form.capacity,
        organizer_id: user.id,
        location_lat: coords?.lat ?? null,
        location_lng: coords?.lng ?? null,
        location_radius: radius ?? null,
        // tools: tools, // Uncomment when backend supports tools
      };
      log.info('submit_start', { payload });
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        log.error('submit_error', { error: data?.error, status: res.status });
        const msg = res.status === 409 ? 'Duplicate event detected: same title and start time' : (data?.error || 'Failed to create event');
        setError(msg);
        showError(msg, 'Create Event Failed');
        return;
      }
      log.info('submit_success', { eventId: data?.id });
      showSuccess('Event created successfully', 'Success');
      setSuccessBanner(true);
      setTimeout(() => navigate('/events'), 800);
    } catch (err) {
      log.error('submit_exception', err);
      const msg = 'Unexpected error creating event';
      setError(msg);
      showError(msg, 'Create Event Failed');
    } finally {
      tm.end();
      grp.end();
      setIsLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-700 dark:text-gray-200 flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Create New Event</h1>
        <div className="size-10" />
      </div>

      <form id="create-event-form" onSubmit={onSubmit} className="space-y-8 max-w-3xl mx-auto px-6 py-8">
        {/* Event Details */}
        <section>
          <h2 className="text-2xl font-bold leading-tight pb-4">Event Details</h2>
          <div className="space-y-4">
            <TextField
              name="title"
              label="Event Title"
              value={form.title}
              onChange={onChange}
              placeholder="e.g., Coastal Cleanup at Sunrise Beach"
              required
              error={formErrors.title}
            />
            <Textarea
              name="description"
              label="Description"
              value={form.description}
              onChange={onChange}
              placeholder="Add a short description"
            />
          </div>
        </section>

        {/* Logistics */}
        <section>
          <h2 className="text-2xl font-bold leading-tight pb-4">Logistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateTimeField
              name="start_time"
              label="Start"
              value={form.start_time}
              onChange={onChange}
              required
              description="Select the starting date and time"
              error={formErrors.start_time}
            />
            <DateTimeField
              name="end_time"
              label="End"
              value={form.end_time}
              onChange={onChange}
              required
              error={formErrors.end_time}
              description="Select the ending date and time"
            />
          </div>
          <div className="mt-4">
            <TextField
              name="location"
              label="Location"
              value={form.location}
              onChange={onChange}
              placeholder="Address or location name"
            />
          </div>
          <div className="mt-6">
            <EventMap
              address={form.location}
              radius={radius}
              onLocationChange={(lat, lng) => setCoords({ lat, lng })}
              onRadiusChange={(r) => setRadius(r)}
            />
          </div>
        </section>

        {/* Requirements */}
        <section>
          <h2 className="text-2xl font-bold leading-tight pb-4">Requirements</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Volunteer Capacity</label>
              <div className="relative flex items-center gap-3">
                <button
                  type="button"
                  onClick={decrementCapacity}
                  className="inline-flex items-center justify-center h-14 w-14 rounded-xl border border-brand-300 hover:bg-brand-50 text-brand-700"
                  aria-label="Decrease capacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
                </button>
                <NumberField
                  name="capacity"
                  label=""
                  value={form.capacity}
                  onChange={onChange}
                  required
                  min={1}
                />
                <button
                  type="button"
                  onClick={incrementCapacity}
                  className="inline-flex items-center justify-center h-14 w-14 rounded-xl border border-brand-300 hover:bg-brand-50 text-brand-700"
                  aria-label="Increase capacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Required Tools</label>
              <div className="flex gap-2">
                <TextField
                  name="toolInput"
                  label=""
                  value={toolInput}
                  onChange={e => setToolInput(e.target.value)}
                  placeholder="Add a tool (e.g., gloves)"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={onAddTool}
                  aria-label="Add tool"
                >
                  Add
                </Button>
              </div>
              {tools.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tools.map((t, i) => (
                    <span key={`${t}-${i}`} className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-sm">
                      {t}
                      <button type="button" onClick={() => removeTool(i)} className="text-brand-700/80 hover:text-brand-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {error && <p className="text-red-600 text-sm" aria-live="polite">{error}</p>}
        {successBanner && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
            Event created successfully. Redirecting...
          </div>
        )}
      </form>

      {/* Sticky Footer Action */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent">
        <div className="max-w-3xl mx-auto">
          <Button form="create-event-form" type="submit" variant="primary" size="md" loading={isLoading} disabled={isLoading || hasValidationError}>
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
