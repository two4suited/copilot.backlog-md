import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, MapPin, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import type { ConferenceDetail } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function ConferenceDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: conference, isPending, isError } = useQuery<ConferenceDetail>({
    queryKey: ['conferences', id],
    queryFn: () => api.conferences.get(id!),
    enabled: !!id,
  });

  if (isPending) return <LoadingSpinner />;
  if (isError || !conference) return <ErrorMessage message="Conference not found." />;

  const start = new Date(conference.startDate).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const end = new Date(conference.endDate).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link to="/conferences" className="text-sm text-indigo-600 hover:underline">← All conferences</Link>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">{conference.name}</h1>
        {conference.description && (
          <p className="mt-3 text-lg text-slate-600 max-w-3xl">{conference.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-400" />
            <span>{start} – {end}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>{conference.location}</span>
          </div>
          {conference.websiteUrl && (
            <a
              href={conference.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:underline"
            >
              <ExternalLink className="w-4 h-4" /> Website
            </a>
          )}
        </div>
      </div>

      {/* Tracks */}
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Tracks</h2>
      {!conference.tracks || conference.tracks.length === 0 ? (
        <p className="text-slate-500">No tracks yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {conference.tracks.map(track => (
            <Link
              key={track.id}
              to={`/conferences/${conference.id}/tracks/${track.id}`}
              className="group flex items-start gap-4 bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all"
              data-testid="track-card"
            >
              <div
                className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: track.color }}
              />
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {track.name}
                </h3>
                {track.description && (
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2">{track.description}</p>
                )}
                <p className="text-slate-400 text-xs mt-2">
                  {track.sessionCount ?? 0} session{(track.sessionCount ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
