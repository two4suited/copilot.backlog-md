import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Speaker } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Mic2 } from 'lucide-react';

function SpeakerAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c2622d&color=faf7f2&size=112&font-size=0.38&bold=true`;
  return (
    <img
      src={photoUrl || fallback}
      alt={name}
      className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-slate-100 shadow-sm"
      onError={e => { (e.currentTarget as HTMLImageElement).src = fallback; }}
    />
  );
}

export function SpeakersPage() {
  const { data: speakers, isPending, isError } = useQuery<Speaker[]>({
    queryKey: ['speakers'],
    queryFn: () => api.speakers.list(),
  });

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load speakers." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand-primary">Speakers</h1>
        <p className="text-brand-muted mt-1">Meet the experts presenting at this year's events.</p>
      </div>

      {!speakers || speakers.length === 0 ? (
        <div className="text-center py-16">
          <Mic2 className="mx-auto w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500">No speakers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {speakers.map(speaker => (
            <Link
              key={speaker.id}
              to={`/speakers/${speaker.id}`}
              className="group bg-brand-surface rounded-2xl border border-brand-border p-5 hover:shadow-md hover:border-brand-accent/40 transition-all flex gap-4 items-start"
              data-testid="speaker-card"
            >
              <SpeakerAvatar name={speaker.name} photoUrl={speaker.photoUrl} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-brand-primary group-hover:text-brand-accent transition-colors leading-snug">
                  {speaker.name}
                </h3>
                {speaker.company && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-brand-accent/10 text-brand-accent text-xs font-medium">
                    {speaker.company}
                  </span>
                )}
                {speaker.bio && (
                  <p className="text-sm text-brand-muted mt-2 line-clamp-2 leading-relaxed">{speaker.bio}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
