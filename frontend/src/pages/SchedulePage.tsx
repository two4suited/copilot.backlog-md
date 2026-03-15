import { useState, useMemo, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Clock, DoorOpen, Users } from 'lucide-react';
import { api } from '../services/api';
import type { Conference, ConferenceDetail, Session, Track } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { LevelBadge } from '../components/LevelBadge';
import { BookmarkButton } from '../components/BookmarkButton';
import { fmtTimeTz, fmtDayLabelTz, dayKeyTz } from '../utils/time';

// ── helpers ────────────────────────────────────────────────────────────────

function fmtTime(iso: string, tz: string) {
  return fmtTimeTz(iso, tz);
}

function fmtDayLabel(iso: string, tz: string) {
  return fmtDayLabelTz(iso, tz);
}

function dayKey(iso: string, tz: string) {
  return dayKeyTz(iso, tz);
}

function durationMins(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

// ── session card ──────────────────────────────────────────────────────────

function SessionCard({ session }: { session: Session }) {
  const mins = durationMins(session.startTime, session.endTime);
  const speakers = session.speakers ?? [];
  const seats = session.seatsAvailable ?? null;
  const isFull = seats !== null && seats <= 0;

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="group relative block h-full bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md hover:border-brand-accent/40 transition-all"
    >
      {/* Bookmark button – stops propagation so the link doesn't fire */}
      <div className="absolute top-2 right-2">
        <BookmarkButton sessionId={session.id} />
      </div>
      <div className="flex items-start gap-1 mb-1.5 pr-8">
        <LevelBadge level={session.level} />
        <span className="ml-auto text-xs text-slate-400 shrink-0 tabular-nums">{mins}m</span>
      </div>
      <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-accent leading-snug line-clamp-3 mb-1.5 transition-colors">
        {session.title}
      </p>
      {speakers.length > 0 && (
        <p className="text-xs text-slate-500 truncate mb-2">
          {speakers.map(s => s.name).join(', ')}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5 mt-auto text-xs text-slate-400">
        {session.room && (
          <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
            <DoorOpen className="w-3 h-3 text-brand-accent" /> {session.room}
          </span>
        )}
        {seats !== null && (
          <span className={`flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md ${isFull ? 'text-red-500 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
            <Users className="w-3 h-3" /> {isFull ? 'Full' : `${seats} left`}
          </span>
        )}
      </div>
    </Link>
  );
}

// ── empty placeholder ──────────────────────────────────────────────────────

function EmptyCell() {
  return <div className="h-full min-h-[80px] rounded-xl bg-slate-50 border border-dashed border-slate-200" />;
}

// ── schedule grid for one day ─────────────────────────────────────────────

interface DayGridProps {
  sessions: Session[];
  tracks: Track[];
  filteredTrackIds: Set<string> | null;
  timezone: string;
}

function DayGrid({ sessions, tracks, filteredTrackIds, timezone }: DayGridProps) {
  const visibleTracks = filteredTrackIds
    ? tracks.filter(t => filteredTrackIds.has(t.id))
    : tracks;

  // Unique sorted time slots for the day
  const timeSlots = useMemo(() => {
    const times = [...new Set(sessions.map(s => fmtTime(s.startTime, timezone)))];
    times.sort();
    return times;
  }, [sessions, timezone]);

  // Index: timeSlot → trackId → session
  const index = useMemo(() => {
    const map: Record<string, Record<string, Session>> = {};
    for (const s of sessions) {
      const t = fmtTime(s.startTime, timezone);
      if (!map[t]) map[t] = {};
      map[t][s.trackId] = s;
    }
    return map;
  }, [sessions, timezone]);

  if (timeSlots.length === 0) {
    return <p className="text-slate-500 text-sm">No sessions scheduled for this day.</p>;
  }

  return (
    /* Desktop: CSS grid; mobile: stacked */
    <div>
      {/* ── Desktop grid ── */}
      <div className="hidden md:block overflow-x-auto">
        <div
          className="grid min-w-max"
          style={{ gridTemplateColumns: `80px repeat(${visibleTracks.length}, minmax(180px, 1fr))` }}
        >
          {/* Header row — sticky at top */}
          <div className="sticky top-16 bg-brand-surface z-20" />
          {visibleTracks.map(track => (
            <div
              key={track.id}
              className="sticky top-16 z-20 px-3 py-2.5 border-b-2 border-slate-200 bg-brand-surface text-center"
            >
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: track.color || '#0ea5e9' }}
              >
                {track.name}
              </span>
            </div>
          ))}

          {/* Time slot rows */}
          {timeSlots.map(time => (
            <Fragment key={time}>
              {/* Time label */}
              <div
                className="sticky left-0 bg-brand-surface flex items-start justify-end pr-3 pt-3 text-xs font-semibold text-slate-500 border-b border-slate-100 z-10"
              >
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-brand-accent" /> {time}
                </span>
              </div>

              {/* Session cells */}
              {visibleTracks.map(track => {
                const session = index[time]?.[track.id];
                return (
                  <div key={`${time}-${track.id}`} className="p-1.5 border-b border-slate-100">
                    {session ? <SessionCard session={session} /> : <EmptyCell />}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* ── Mobile stacked ── */}
      <div className="md:hidden space-y-6">
        {timeSlots.map(time => (
          <div key={time}>
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-500">
              <Clock className="w-4 h-4 text-brand-accent" /> {time}
            </div>
            <div className="space-y-2 pl-6">
              {visibleTracks.map(track => {
                const session = index[time]?.[track.id];
                if (!session) return null;
                return (
                  <div key={track.id}>
                    <p className="text-xs font-medium text-slate-400 mb-1">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                        style={{ backgroundColor: track.color }}
                      />
                      {track.name}
                    </p>
                    <SessionCard session={session} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────

export function SchedulePage() {
  const [selectedConferenceId, setSelectedConferenceId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filteredTrackIds, setFilteredTrackIds] = useState<Set<string> | null>(null);

  // 1. Fetch all conferences
  const { data: conferences, isPending: confLoading, isError: confError } = useQuery<Conference[]>({
    queryKey: ['conferences'],
    queryFn: () => api.conferences.list(),
  });

  const conferenceId = selectedConferenceId ?? conferences?.[0]?.id ?? null;

  // 2. Fetch conference detail (includes tracks)
  const { data: conference, isPending: detailLoading } = useQuery<ConferenceDetail>({
    queryKey: ['conferences', conferenceId],
    queryFn: () => api.conferences.get(conferenceId!),
    enabled: !!conferenceId,
  });

  // 3. Fetch sessions for the selected conference
  const { data: sessions = [], isPending: sessionsLoading } = useQuery<Session[]>({
    queryKey: ['sessions', 'conference', conferenceId],
    queryFn: () => api.sessions.listByConference(conferenceId!),
    enabled: !!conferenceId,
  });

  // Group sessions by day
  const timezone = conference?.timezone ?? 'UTC';
  const sessionsByDay = useMemo(() => {
    const map: Record<string, Session[]> = {};
    for (const s of sessions) {
      const k = dayKey(s.startTime, timezone);
      if (!map[k]) map[k] = [];
      map[k].push(s);
    }
    return map;
  }, [sessions, timezone]);

  const days = useMemo(() => Object.keys(sessionsByDay).sort(), [sessionsByDay]);
  const activeDay = selectedDay ?? days[0] ?? null;

  const tracks: Track[] = conference?.tracks ?? [];

  // Toggle track filter
  function toggleTrack(trackId: string) {
    setFilteredTrackIds(prev => {
      if (prev === null) {
        // All visible → filter to just this one
        return new Set([trackId]);
      }
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
        return next.size === 0 ? null : next;
      } else {
        next.add(trackId);
        return next.size === tracks.length ? null : next;
      }
    });
  }

  const isLoading = confLoading || detailLoading || sessionsLoading;

  if (confError) return <ErrorMessage message="Failed to load conferences." />;
  if (isLoading) return <LoadingSpinner />;
  if (!conference) return <ErrorMessage message="No conference found." />;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Schedule</h1>

        {/* Conference selector (only show if multiple) */}
        {conferences && conferences.length > 1 && (
          <select
            value={conferenceId ?? ''}
            onChange={e => {
              setSelectedConferenceId(e.target.value);
              setSelectedDay(null);
              setFilteredTrackIds(null);
            }}
            aria-label="Select conference"
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {conferences.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Day tabs */}
      {days.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {days.map((d, i) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                d === activeDay
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              Day {i + 1} — {fmtDayLabel(`${d}T00:00:00`, timezone)}
            </button>
          ))}
        </div>
      )}

      {/* Track filter bar */}
      {tracks.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs font-medium text-slate-400 self-center">Filter tracks:</span>
          {tracks.map(track => {
            const active = filteredTrackIds === null || filteredTrackIds.has(track.id);
            return (
              <button
                key={track.id}
                onClick={() => toggleTrack(track.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-white border-slate-300 text-slate-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                {track.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {activeDay ? (
        <DayGrid
          sessions={sessionsByDay[activeDay] ?? []}
          tracks={tracks}
          filteredTrackIds={filteredTrackIds}
          timezone={timezone}
        />
      ) : (
        <p className="text-slate-500">No sessions scheduled yet.</p>
      )}
    </div>
  );
}
