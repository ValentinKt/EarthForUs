import React, { useState } from 'react';
import Button from '../../../shared/ui/Button';
import { useNavigate } from 'react-router-dom';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    capacity: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'capacity' ? Number(value) : value }));
    setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        capacity: form.capacity,
      };
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to create event');
        return;
      }
      navigate('/events');
    } catch (err) {
      setError('Unexpected error creating event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={onChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
          <input id="description" name="description" value={form.description} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="location">Location</label>
          <input id="location" name="location" value={form.location} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="start_time">Start Time</label>
            <input id="start_time" name="start_time" type="datetime-local" value={form.start_time} onChange={onChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="end_time">End Time</label>
            <input id="end_time" name="end_time" type="datetime-local" value={form.end_time} onChange={onChange} className="w-full border rounded px-3 py-2" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="capacity">Capacity</label>
          <input id="capacity" name="capacity" type="number" min={1} value={form.capacity} onChange={onChange} className="w-full border rounded px-3 py-2" required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" variant="primary" size="md" loading={isLoading} disabled={isLoading}>Create Event</Button>
      </form>
    </div>
  );
};

export default CreateEventPage;