import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import type { Conference, Track, Speaker, Session } from '../../types';

function toDateTimeLocal(dt: string) {
  if (!dt) return '';
  const d = new Date(dt);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const SESSION_TYPES = ['Talk', 'Workshop', 'Panel', 'Keynote', 'Lightning Talk'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All'];

interface FormData {
  title: string;
  description: string;
  conferenceId: string;
  trackId: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
  sessionType: string;
  level: string;
  slidesUrl: string;
  recordingUrl: string;
  speakerIds: string[];
}

interface FormErrors {
  title?: string;
  trackId?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  capacity?: string;
  sessionType?: string;
  level?: string;
}

export function SessionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast, showToast, clearToast } = useToast();

  const [form, setForm] = useState<FormData>({
    title: '', description: '', conferenceId: '', trackId: '',
    startTime: '', endTime: '', room: '', capacity: 50,
    sessionType: 'Talk', level: 'All', slidesUrl: '', recordingUrl: '', speakerIds: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: conferences } = useQuery<Conference[]>({
    queryKey: ['conferences'],
    queryFn: () => api.conferences.list(),
  });

  const { data: tracks } = useQuery<Track[]>({
    queryKey: ['tracks', form.conferenceId],
    queryFn: () => api.tracks.list(form.conferenceId),
    enabled: !!form.conferenceId,
  });

  const { data: speakers } = useQuery<Speaker[]>({
    queryKey: ['speakers'],
    queryFn: () => api.speakers.list(),
  });

  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ['session', id],
    queryFn: () => api.sessions.get(id!),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (session) {
      setForm({
        title: session.title,
        description: session.description ?? '',
        conferenceId: session.track?.conferenceId ?? '',
        trackId: session.trackId,
        startTime: toDateTimeLocal(session.startTime),
        endTime: toDateTimeLocal(session.endTime),
        room: session.room,
        capacity: session.seatsTotal,
        sessionType: session.sessionType,
        level: session.level,
        slidesUrl: session.slidesUrl ?? '',
        recordingUrl: session.recordingUrl ?? '',
        speakerIds: session.speakers?.map(s => s.id) ?? [],
      });
    }
  }, [session]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isNew) {
        await api.sessions.create({
          trackId: data.trackId,
          title: data.title,
          description: data.description || null,
          startTime: data.startTime,
          endTime: data.endTime,
          room: data.room,
          capacity: data.capacity,
          sessionType: data.sessionType,
          level: data.level,
          speakerIds: data.speakerIds.length > 0 ? data.speakerIds : null,
        });
      } else {
        await api.sessions.update(id!, {
          title: data.title,
          description: data.description || null,
          startTime: data.startTime,
          endTime: data.endTime,
          room: data.room,
          capacity: data.capacity,
          sessionType: data.sessionType,
          level: data.level,
          slidesUrl: data.slidesUrl || null,
          recordingUrl: data.recordingUrl || null,
        });
        await api.sessions.updateSpeakers(id!, data.speakerIds);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] });
      showToast(isNew ? 'Session created' : 'Session updated');
      setTimeout(() => navigate('/admin/sessions'), 1200);
    },
    onError: () => {
      showToast('Failed to save session', 'error');
    },
  });

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.trackId) errs.trackId = 'Track is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (!form.endTime) errs.endTime = 'End time is required';
    if (!form.room.trim()) errs.room = 'Room is required';
    if (!form.capacity || form.capacity < 1) errs.capacity = 'Capacity must be at least 1';
    if (!form.sessionType) errs.sessionType = 'Session type is required';
    if (!form.level) errs.level = 'Level is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) saveMutation.mutate(form);
  }

  function toggleSpeaker(speakerId: string) {
    setForm(f => ({
      ...f,
      speakerIds: f.speakerIds.includes(speakerId)
        ? f.speakerIds.filter(sid => sid !== speakerId)
        : [...f.speakerIds, speakerId],
    }));
  }

  if (!isNew && isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/sessions" className="flex items-center gap-1 text-sm text-brand-muted dark:text-[#c4a882] hover:text-brand-primary dark:hover:text-[#f5f0eb] mb-6">
        <ChevronLeft className="w-4 h-4" />
        Back to Sessions
      </Link>

      <h1 className="text-2xl font-bold text-brand-primary dark:text-[#f5f0eb] mb-6">
        {isNew ? 'New Session' : session?.title ? `Edit Session: ${session.title}` : 'Edit Session'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-brand-surface dark:bg-[#2c1810] rounded-xl border border-brand-border dark:border-[#4a2e20] p-6 space-y-5">
        <div>
          <label htmlFor="session-title" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Title *</label>
          <input
            id="session-title"
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className={`w-full px-3 py-2 rounded-lg border bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.title ? 'border-red-400' : 'border-brand-border dark:border-[#4a2e20]'}`}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="session-description" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Description</label>
          <textarea
            id="session-description"
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-brand-border dark:border-[#4a2e20] bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>

        <div>
          <label htmlFor="session-conference" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Conference</label>
          <select
            id="session-conference"
            value={form.conferenceId}
            onChange={e => setForm(f => ({ ...f, conferenceId: e.target.value, trackId: '' }))}
            className="w-full px-3 py-2 rounded-lg border border-brand-border dark:border-[#4a2e20] bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            <option value="">Select a conference...</option>
            {conferences?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="session-track" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Track *</label>
          <select
            id="session-track"
            value={form.trackId}
            onChange={e => setForm(f => ({ ...f, trackId: e.target.value }))}
            disabled={!form.conferenceId}
            className={`w-full px-3 py-2 rounded-lg border bg-brand-bg dark:bg-[#1a0f0a] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.trackId ? 'border-red-400' : 'border-brand-border dark:border-[#4a2e20]'} ${!form.conferenceId ? 'text-brand-muted dark:text-[#c4a882]' : 'text-brand-primary dark:text-[#f5f0eb]'}`}
          >
            <option value="">Select a track...</option>
            {tracks?.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {errors.trackId && <p className="mt-1 text-xs text-red-600">{errors.trackId}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="session-start-time" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Start Time *</label>
            <input
              id="session-start-time"
              type="datetime-local"
              value={form.startTime}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.startTime ? 'border-red-400' : 'border-brand-border dark:border-[#4a2e20]'}`}
            />
            {errors.startTime && <p className="mt-1 text-xs text-red-600">{errors.startTime}</p>}
          </div>
          <div>
            <label htmlFor="session-end-time" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">End Time *</label>
            <input
              id="session-end-time"
              type="datetime-local"
              value={form.endTime}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.endTime ? 'border-red-400' : 'border-brand-border dark:border-[#4a2e20]'}`}
            />
            {errors.endTime && <p className="mt-1 text-xs text-red-600">{errors.endTime}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="session-room" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Room *</label>
            <input
              id="session-room"
              type="text"
              value={form.room}
              onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.room ? 'border-red-400' : 'border-brand-border dark:border-[#4a2e20]'}`}
            />
            {errors.room && <p className="mt-1 text-xs text-red-600">{errors.room}</p>}
          </div>
          <div>
            <label htmlFor="session-capacity" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Capacity *</label>
            <input
              id="session-capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 1 }))}
              className={`w-full px-3 py-2 rounded-lg border bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.capacity ? 'border-red-400' : 'border-brand-border dark:border-[#4a2e20]'}`}
            />
            {errors.capacity && <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="session-type" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Session Type *</label>
            <select
              id="session-type"
              value={form.sessionType}
              onChange={e => setForm(f => ({ ...f, sessionType: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.sessionType ? 'border-red-400' : 'border-brand-border dark:border-[#4a2e20]'}`}
            >
              {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.sessionType && <p className="mt-1 text-xs text-red-600">{errors.sessionType}</p>}
          </div>
          <div>
            <label htmlFor="session-level" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Level *</label>
            <select
              id="session-level"
              value={form.level}
              onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.level ? 'border-red-400' : 'border-brand-border dark:border-[#4a2e20]'}`}
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.level && <p className="mt-1 text-xs text-red-600">{errors.level}</p>}
          </div>
        </div>

        {!isNew && (
          <>
            <div>
              <label htmlFor="session-slides-url" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Slides URL</label>
              <input
                id="session-slides-url"
                type="url"
                value={form.slidesUrl}
                onChange={e => setForm(f => ({ ...f, slidesUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-brand-border dark:border-[#4a2e20] bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label htmlFor="session-recording-url" className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1">Recording URL</label>
              <input
                id="session-recording-url"
                type="url"
                value={form.recordingUrl}
                onChange={e => setForm(f => ({ ...f, recordingUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-brand-border dark:border-[#4a2e20] bg-brand-bg dark:bg-[#1a0f0a] text-brand-primary dark:text-[#f5f0eb] text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-2">Speakers</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-brand-border dark:border-[#4a2e20] rounded-lg p-3">
            {speakers?.map(speaker => (
              <label key={speaker.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-[#f5f0eb] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.speakerIds.includes(speaker.id)}
                  onChange={() => toggleSpeaker(speaker.id)}
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent"
                />
                <span>{speaker.name}</span>
              </label>
            ))}
            {(!speakers || speakers.length === 0) && (
              <p className="text-slate-400 dark:text-[#c4a882] text-sm col-span-2">No speakers available</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/admin/sessions" className="px-4 py-2 rounded-lg border border-brand-border dark:border-[#4a2e20] text-slate-700 dark:text-[#f5f0eb] text-sm font-medium hover:bg-slate-50 dark:hover:bg-[#4a2e20]/40 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : isNew ? 'Create Session' : 'Save Changes'}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
