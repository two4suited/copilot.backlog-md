import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Speaker } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

function SpeakerAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-14 h-14 rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-lg shrink-0">
      {initials}
    </div>
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
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Speakers</h1>
      {!speakers || speakers.length === 0 ? (
        <p className="text-slate-500">No speakers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {speakers.map(speaker => (
            <Link
              key={speaker.id}
              to={`/speakers/${speaker.id}`}
              className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all flex gap-4 items-start"
              data-testid="speaker-card"
            >
              <SpeakerAvatar name={speaker.name} photoUrl={speaker.photoUrl} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {speaker.name}
                </h3>
                {speaker.company && (
                  <p className="text-sm text-slate-500 mt-0.5">{speaker.company}</p>
                )}
                {speaker.bio && (
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{speaker.bio}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
