import React, { useState, useEffect } from 'react';
import Button from '../../../shared/ui/Button';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../../shared/utils/logger';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const log = logger.withContext('CreateEventPage');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    capacity: 10,
  });
  const [tools, setTools] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [hasValidationError, setHasValidationError] = useState(false);

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
        setError(data?.error || 'Failed to create event');
        return;
      }
      log.info('submit_success', { eventId: data?.id });
      navigate('/events');
    } catch (err) {
      log.error('submit_exception', err);
      setError('Unexpected error creating event');
    } finally {
      tm.end();
      grp.end();
      setIsLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-700 flex size-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Create New Event</h1>
        <div className="size-10" />
      </div>

      <form id="create-event-form" onSubmit={onSubmit} className="space-y-8 max-w-3xl mx-auto px-4 py-6">
        {/* Event Details */}
        <section>
          <h2 className="text-2xl font-bold leading-tight pb-4">Event Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="title">Event Title</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 bg-white h-14 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g., Coastal Cleanup at Sunrise Beach"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 bg-white min-h-36 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Add a short description"
              />
            </div>
          </div>
        </section>

        {/* Logistics */}
        <section>
          <h2 className="text-2xl font-bold leading-tight pb-4">Logistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="start_time">Start</label>
              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={form.start_time}
                onChange={onChange}
                aria-invalid={hasValidationError}
                className="w-full rounded-xl border border-gray-300 bg-white h-14 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="end_time">End</label>
              <input
                id="end_time"
                name="end_time"
                type="datetime-local"
                value={form.end_time}
                onChange={onChange}
                aria-invalid={hasValidationError}
                className="w-full rounded-xl border border-gray-300 bg-white h-14 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
          </div>
          {hasValidationError && (
            <p className="text-sm text-red-600 mt-2" aria-live="polite">End time must be after start time.</p>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2" htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={onChange}
              className="w-full rounded-xl border border-gray-300 bg-white h-14 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Address or location name"
            />
          </div>
        </section>

        {/* Requirements */}
        <section>
          <h2 className="text-2xl font-bold leading-tight pb-4">Requirements</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="capacity">Volunteer Capacity</label>
              <div className="relative flex items-center gap-3">
                <button
                  type="button"
                  onClick={decrementCapacity}
                  className="inline-flex items-center justify-center h-14 w-14 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700"
                  aria-label="Decrease capacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
                </button>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={onChange}
                  className="flex-1 rounded-xl border border-gray-300 bg-white h-14 px-4 text-base text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <button
                  type="button"
                  onClick={incrementCapacity}
                  className="inline-flex items-center justify-center h-14 w-14 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700"
                  aria-label="Increase capacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Required Tools</label>
              <div className="flex gap-2">
                <input
                  value={toolInput}
                  onChange={e => setToolInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddTool(); } }}
                  placeholder="Add a tool (e.g., gloves)"
                  className="form-input flex-1 rounded-xl border border-gray-300 bg-white h-14 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={onAddTool}
                  className="flex-shrink-0 bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-5 font-semibold"
                >
                  Add
                </button>
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
      </form>

      {/* Sticky Footer Action */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white to-transparent">
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