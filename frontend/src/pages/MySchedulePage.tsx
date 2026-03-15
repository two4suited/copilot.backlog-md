import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, DoorOpen, Users, CalendarX, Tag, Download } from 'lucide-react';
import { api } from '../services/api';
import type { Session } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { LevelBadge } from '../components/LevelBadge';
import { useAuth } from '../context/AuthContext';
import { fmtTimeTz, fmtDayLabelTz } from '../utils/time';

interface MyRegistrationsResponse {
  sessions: Session[];
}

function groupByDay(sessions: Session[]): Map<string, Session[]> {
  const map = new Map<string, Session[]>();
  for (const session of sessions) {
    const tz = session.conferenceTimezone ?? 'UTC';
    const day = fmtDayLabelTz(session.startTime, tz) + ', ' +
      new Date(session.startTime).getFullYear();
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(session);
  }
  return map;
}

export function MySchedulePage() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const { data, isPending, isError } = useQuery<MyRegistrationsResponse>({
    queryKey: ['my-registrations'],
    queryFn: () => api.registrations.myRegistrations(),
  });

  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) => api.registrations.cancel(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const handleExport = async () => {
    const res = await fetch('/api/registrations/export/ical', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-schedule.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load your schedule." />;

  const sessions = data?.sessions ?? [];
  const grouped = groupByDay(sessions);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">My Schedule</h1>
            <p className="mt-1 text-brand-muted">
              {sessions.length === 0
                ? 'You have no registered sessions yet.'
                : `${sessions.length} session${sessions.length !== 1 ? 's' : ''} registered`}
            </p>
          </div>
          {sessions.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-brand-border text-brand-primary hover:bg-brand-border/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export to Calendar
            </button>
          )}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <CalendarX className="w-12 h-12 mb-3" />
          <p className="text-lg font-medium">No sessions yet</p>
          <p className="text-sm mt-1">Browse conferences and register for sessions to build your schedule.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([day, daySessions]) => (
            <div key={day}>
              <h2 className="text-lg font-semibold text-brand-primary mb-3 border-b border-brand-border pb-2">
                {day}
              </h2>
              <div className="space-y-3">
                {daySessions.map(session => {
                  const tz = session.conferenceTimezone ?? 'UTC';
                  const start = fmtTimeTz(session.startTime, tz);
                  const end = fmtTimeTz(session.endTime, tz);
                  const isCancelling = cancelMutation.isPending &&
                    cancelMutation.variables === session.id;

                  return (
                    <div
                      key={session.id}
                      className="bg-brand-surface rounded-xl border border-brand-border p-4 flex items-start gap-4"
                    >
                      <div className="text-slate-400 text-sm font-mono min-w-[80px] shrink-0">
                        {start}<br />{end}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-brand-primary">{session.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-500 text-sm">
                          <span className="flex items-center gap-1">
                            <DoorOpen className="w-3.5 h-3.5" /> {session.room}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {session.sessionType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {session.registrationCount}/{session.seatsTotal}
                          </span>
                          {session.track && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5" />
                              <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ backgroundColor: session.track.color }}
                              />
                              {session.track.name}
                            </span>
                          )}
                          <LevelBadge level={session.level} />
                        </div>
                      </div>
                      <button
                        onClick={() => cancelMutation.mutate(session.id)}
                        disabled={isCancelling}
                        className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isCancelling ? 'Removing…' : 'Remove from schedule'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
