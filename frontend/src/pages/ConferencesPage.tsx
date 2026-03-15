import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Layers } from 'lucide-react';
import { api } from '../services/api';
import type { Conference, PagedResult } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

// Warm earth tone gradient palettes cycled per card
const CARD_GRADIENTS = [
  'from-brand-primary to-stone-700',
  'from-stone-700 to-amber-900',
  'from-amber-900 to-brand-primary',
  'from-stone-800 to-amber-800',
];

function ConferenceCard({ conference, index }: { conference: Conference; index: number }) {
  const start = new Date(conference.startDate);
  const end = new Date(conference.endDate);

  const dateBadge = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <Link
      to={`/conferences/${conference.id}`}
      className="group block bg-brand-surface rounded-2xl border border-brand-border overflow-hidden hover:shadow-xl hover:border-brand-accent/40 transition-all duration-200"
      data-testid="conference-card"
    >
      {/* Gradient image placeholder */}
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-end p-3 overflow-hidden`}>
        {/* Decorative grid dots */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <CalendarDays className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 text-white/10" />
        {/* Date badge — terracotta */}
        <span className="relative z-10 inline-flex items-center gap-1.5 bg-brand-accent text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm">
          <CalendarDays className="w-3 h-3" />
          {dateBadge}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="font-semibold text-brand-primary text-lg leading-snug group-hover:text-brand-accent transition-colors line-clamp-2">
          {conference.name}
        </h3>
        {conference.description && (
          <p className="text-brand-muted text-sm mt-1.5 line-clamp-2 leading-relaxed">{conference.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Location pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-bg border border-brand-border text-xs text-brand-muted font-medium">
            <MapPin className="w-3 h-3 text-brand-accent shrink-0" />
            {conference.location}
          </span>
          {/* Tracks pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-accent/10 text-xs text-brand-accent font-medium">
            <Layers className="w-3 h-3 shrink-0" />
            {conference.trackCount ?? 0} track{(conference.trackCount ?? 0) !== 1 ? 's' : ''}
          </span>
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

  const items: Conference[] = Array.isArray(data) ? data : (data?.items ?? []);

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load conferences." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand-primary">Conferences</h1>
        <p className="text-brand-muted mt-1">Explore upcoming tech events and plan your schedule.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((c, i) => <ConferenceCard key={c.id} conference={c} index={i} />)}
        {items.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <CalendarDays className="mx-auto w-12 h-12 mb-3 text-slate-300" />
            <p className="font-medium text-slate-600">No conferences yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
