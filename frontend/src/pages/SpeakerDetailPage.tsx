import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Clock, DoorOpen, Twitter, Linkedin } from 'lucide-react';
import { api } from '../services/api';
import type { Speaker, Session } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { LevelBadge } from '../components/LevelBadge';
import { fmtShortDateTz, fmtTimeRangeTz } from '../utils/time';

function LargeAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
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
        className="w-24 h-24 rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <div className="w-24 h-24 rounded-full bg-brand-surface text-brand-accent flex items-center justify-center font-bold text-2xl shrink-0 border-2 border-brand-border">
      {initials}
    </div>
  );
}

interface SpeakerDetail extends Speaker {
  sessions?: Session[];
}

export function SpeakerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: speaker, isPending, isError } = useQuery<SpeakerDetail>({
    queryKey: ['speakers', id],
    queryFn: () => api.speakers.get(id!),
    enabled: !!id,
  });

  if (isPending) return <LoadingSpinner />;
  if (isError || !speaker) return <ErrorMessage message="Speaker not found." />;

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Link to="/speakers" className="text-sm text-brand-accent hover:underline mb-6 inline-block">
        ← All speakers
      </Link>

      {/* Profile header */}
      <div className="flex gap-6 items-start mb-8">
        <LargeAvatar name={speaker.name} photoUrl={speaker.photoUrl} />
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-brand-primary">{speaker.name}</h1>
          {speaker.company && (
            <p className="text-slate-500 text-lg mt-1">{speaker.company}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-3">
            {speaker.twitterHandle && (
              <a
                href={`https://twitter.com/${speaker.twitterHandle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-brand-accent hover:underline"
              >
                <Twitter className="w-4 h-4" />
                @{speaker.twitterHandle.replace(/^@/, '')}
              </a>
            )}
            {speaker.linkedInUrl && (
              <a
                href={speaker.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-brand-accent hover:underline"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {speaker.bio && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand-primary mb-3">About</h2>
          <p className="text-brand-primary leading-relaxed whitespace-pre-line">{speaker.bio}</p>
        </section>
      )}

      {/* Sessions */}
      {speaker.sessions && speaker.sessions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-brand-primary mb-4">Sessions</h2>
          <div className="space-y-3">
            {speaker.sessions.map(session => {
              const tz = session.conferenceTimezone ?? 'UTC';
              const timeStr = fmtTimeRangeTz(session.startTime, session.endTime, tz);
              const dateStr = fmtShortDateTz(session.startTime, tz);
              return (
                <Link
                  key={session.id}
                  to={`/sessions/${session.id}`}
                  className="group block bg-brand-surface rounded-xl border border-brand-border p-4 hover:shadow-md hover:border-brand-accent/30 transition-all"
                  data-testid="session-card"
                >
                  <h3 className="font-semibold text-brand-primary group-hover:text-brand-accent transition-colors">
                    {session.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-500 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {dateStr}, {timeStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5" /> {session.room}
                    </span>
                    {session.track?.name && (
                      <span className="text-brand-sage">{session.track.name}</span>
                    )}
                    <LevelBadge level={session.level} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
