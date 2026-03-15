import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Clock, DoorOpen, Users, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import type { Session } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { LevelBadge } from '../components/LevelBadge';
import { useAuth } from '../context/AuthContext';
import { useSessionSeats } from '../hooks/useSessionSeats';
import { fmtDayLabelTz, fmtTimeRangeTz } from '../utils/time';

function SpeakerAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c2622d&color=faf7f2&size=96&font-size=0.38&bold=true`;
  return (
    <img
      src={photoUrl || fallback}
      alt={name}
      className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-slate-100 shadow-sm"
      onError={e => { (e.currentTarget as HTMLImageElement).src = fallback; }}
    />
  );
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [registered, setRegistered] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: session, isPending, isError } = useQuery<Session>({
    queryKey: ['sessions', id],
    queryFn: () => api.sessions.get(id!),
    enabled: !!id,
  });

  const { seatsAvailable, isConnected } = useSessionSeats(id, session?.seatsAvailable ?? null);

  const registerMutation = useMutation({
    mutationFn: () => api.registrations.register(id!),
    onSuccess: () => {
      setRegistered(true);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['sessions', id] });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setActionError(msg ?? 'Registration failed. Please try again.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.registrations.cancel(id!),
    onSuccess: () => {
      setRegistered(false);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['sessions', id] });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    },
    onError: () => {
      setActionError('Failed to cancel registration. Please try again.');
    },
  });

  if (isPending) return <LoadingSpinner />;
  if (isError || !session) return <ErrorMessage message="Session not found." />;

  const tz = session.conferenceTimezone ?? 'UTC';
  const dateStr = fmtDayLabelTz(session.startTime, tz);
  const timeStr = fmtTimeRangeTz(session.startTime, session.endTime, tz);

  const isFull = seatsAvailable !== null && seatsAvailable <= 0;

  const conferenceId = session.track?.conferenceId;
  const trackId = session.trackId;

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-[#c4a882] mb-6 flex-wrap">
        <Link to="/conferences" className="hover:text-brand-accent hover:underline">Conferences</Link>
        {conferenceId && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/conferences/${conferenceId}`} className="hover:text-brand-accent hover:underline">
              Conference
            </Link>
          </>
        )}
        {conferenceId && trackId && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to={`/conferences/${conferenceId}/tracks/${trackId}`}
              className="hover:text-brand-accent hover:underline"
            >
              {session.track?.name ?? 'Track'}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 dark:text-[#f5f0eb] font-medium truncate max-w-[200px]">{session.title}</span>
      </nav>

      {/* Title & badges */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <LevelBadge level={session.level} />
          {session.sessionType && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#4a2e20] text-slate-600 dark:text-[#c4a882]">
              {session.sessionType}
            </span>
          )}
          {session.track && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: session.track.color || '#9e4820' }}
            >
              {session.track.name}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-brand-primary dark:text-[#f5f0eb]">{session.title}</h1>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-slate-500 dark:text-[#c4a882] text-sm mb-6">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-brand-accent" />
          {dateStr}, {timeStr}
        </span>
        <span className="flex items-center gap-1.5">
          <DoorOpen className="w-4 h-4 text-brand-accent" />
          {session.room}
        </span>
        {seatsAvailable !== null && (
          <span className={`flex items-center gap-1.5 font-medium ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
            <Users className="w-4 h-4" />
            {isFull ? 'Full' : `${seatsAvailable} seat${seatsAvailable !== 1 ? 's' : ''} remaining`}
            {isConnected && (
              <span className="inline-flex items-center gap-1 ml-1 text-xs font-semibold text-brand-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                LIVE
              </span>
            )}
          </span>
        )}
      </div>

      {/* Seat availability progress bar */}
      {seatsAvailable !== null && session.seatsTotal > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#c4a882] mb-1">
            <span className="font-medium">Seat availability</span>
            <span>{seatsAvailable} / {session.seatsTotal} remaining</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-[#4a2e20] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? 'bg-red-500' : seatsAvailable / session.seatsTotal < 0.2 ? 'bg-brand-accent' : 'bg-brand-sage'
              }`}
              style={{ width: `${Math.max(0, (seatsAvailable / session.seatsTotal) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Track link */}
      {session.track && conferenceId && (
        <div className="mb-6">
          <span className="text-slate-500 dark:text-[#c4a882] text-sm">Track: </span>
          <Link
            to={`/conferences/${conferenceId}/tracks/${trackId}`}
            className="text-sm text-brand-accent hover:underline font-medium"
          >
            {session.track.name}
          </Link>
        </div>
      )}

      {/* Description */}
      {session.description && (
        <p className="text-slate-700 dark:text-[#f5f0eb] leading-relaxed mb-8 whitespace-pre-line">{session.description}</p>
      )}

      {/* Registration */}
      {isAuthenticated && (
        <div className="mb-8">
          {registered ? (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-200">
                ✓ Registered for this session
              </div>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel registration'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => registerMutation.mutate()}
              disabled={isFull || registerMutation.isPending}
              className="px-5 py-2.5 rounded-lg bg-brand-accent text-white font-semibold text-sm hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? 'Registering…' : isFull ? 'Session Full' : 'Register for this session'}
            </button>
          )}
          {actionError && (
            <p className="mt-2 text-sm text-red-600">{actionError}</p>
          )}
        </div>
      )}

      {/* Speakers */}
      {session.speakers && session.speakers.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-brand-primary dark:text-[#f5f0eb] mb-4">
            Speaker{session.speakers.length !== 1 ? 's' : ''}
          </h2>
          <div className="space-y-4">
            {session.speakers.map(speaker => (
              <div key={speaker.id} className="bg-brand-surface dark:bg-[#2c1810] rounded-xl border border-brand-border dark:border-[#4a2e20] p-5 flex gap-4">
                <SpeakerAvatar name={speaker.name} photoUrl={speaker.photoUrl} />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/speakers/${speaker.id}`}
                    className="font-semibold text-slate-900 dark:text-[#f5f0eb] hover:text-brand-accent hover:underline"
                  >
                    {speaker.name}
                  </Link>
                  {speaker.company && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-brand-accent/10 text-brand-accent text-xs font-medium">
                      {speaker.company}
                    </span>
                  )}
                  {speaker.bio && (
                    <p className="text-sm text-slate-600 dark:text-[#c4a882] mt-2 line-clamp-3">{speaker.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
