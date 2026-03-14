import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Layers } from 'lucide-react';
import { api } from '../services/api';
import type { Conference, PagedResult } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

function ConferenceCard({ conference }: { conference: Conference }) {
  const start = new Date(conference.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const end = new Date(conference.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Link
      to={`/conferences/${conference.id}`}
      className="block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
      data-testid="conference-card"
    >
      <h3 className="font-semibold text-slate-900 text-xl leading-tight">{conference.name}</h3>
      {conference.description && (
        <p className="text-slate-500 text-sm mt-2 line-clamp-2">{conference.description}</p>
      )}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <CalendarDays className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{start} – {end}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{conference.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{conference.trackCount ?? 0} track{(conference.trackCount ?? 0) !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  );
}

export function ConferencesPage() {
  const { data, isPending, isError } = useQuery<PagedResult<Conference>>({
    queryKey: ['conferences'],
    queryFn: () => api.conferences.list(),
  });

  // Support both paged results and plain arrays from the API
  const items: Conference[] = Array.isArray(data) ? data : (data?.items ?? []);

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load conferences." />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Conferences</h1>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(c => <ConferenceCard key={c.id} conference={c} />)}
        {items.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <CalendarDays className="mx-auto w-12 h-12 mb-3" />
            <p className="font-medium text-slate-600">No conferences yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
