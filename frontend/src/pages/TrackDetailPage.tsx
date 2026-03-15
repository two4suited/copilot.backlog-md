import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Clock, DoorOpen } from 'lucide-react';
import { api } from '../services/api';
import type { TrackDetail } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { LevelBadge } from '../components/LevelBadge';
import { fmtTimeTz } from '../utils/time';

export function TrackDetailPage() {
  const { id, trackId } = useParams<{ id: string; trackId: string }>();

  const { data: track, isPending, isError } = useQuery<TrackDetail>({
    queryKey: ['tracks', id, trackId],
    queryFn: () => api.tracks.get(id!, trackId!),
    enabled: !!id && !!trackId,
  });

  if (isPending) return <LoadingSpinner />;
  if (isError || !track) return <ErrorMessage message="Track not found." />;

  return (
    <div>
      <Link to={`/conferences/${id}`} className="text-sm text-brand-accent hover:underline">
        ← Back to conference
      </Link>
      <div className="flex items-center gap-3 mt-2 mb-6">
        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: track.color }} />
        <h1 className="text-3xl font-bold text-brand-primary">{track.name}</h1>
      </div>
      {track.description && (
        <p className="text-slate-600 mb-6 max-w-2xl">{track.description}</p>
      )}

      <h2 className="text-xl font-semibold text-brand-primary mb-4">Sessions</h2>
      <div className="space-y-3">
        {track.sessions?.map(session => {
          const tz = session.conferenceTimezone ?? 'UTC';
          const start = fmtTimeTz(session.startTime, tz);
          const end = fmtTimeTz(session.endTime, tz);
          return (
            <div
              key={session.id}
              className="bg-brand-surface rounded-xl border border-brand-border p-4 flex items-start gap-4"
              data-testid="session-card"
            >
              <div className="text-slate-400 text-sm font-mono min-w-[80px] shrink-0">
                {start}<br />{end}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">{session.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-500 text-sm">
                  <span className="flex items-center gap-1">
                    <DoorOpen className="w-3.5 h-3.5" /> {session.room}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {session.sessionType}
                  </span>
                  <LevelBadge level={session.level} />
                </div>
              </div>
            </div>
          );
        })}
        {(!track.sessions || track.sessions.length === 0) && (
          <p className="text-slate-500 text-sm">No sessions in this track yet.</p>
        )}
      </div>
    </div>
  );
}
