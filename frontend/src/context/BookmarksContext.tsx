import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import type { Session } from '../types';

const OFFLINE_KEY = 'offline_bookmarks';

function loadOffline(): Set<string> {
  try {
    const raw = localStorage.getItem(OFFLINE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

interface BookmarksContextValue {
  isBookmarked: (id: string) => boolean;
  toggle: (id: string) => void;
  isPendingFor: (id: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [offlineIds, setOfflineIds] = useState<Set<string>>(loadOffline);
  // optimistic map: sessionId → expected bookmarked state while mutation is in flight
  const [optimistic, setOptimistic] = useState<Map<string, boolean>>(new Map());

  const { data } = useQuery<{ sessions: Session[] }>({
    queryKey: ['my-registrations'],
    queryFn: () => api.registrations.myRegistrations(),
    enabled: isAuthenticated,
  });

  const apiIds = new Set<string>((data?.sessions ?? []).map(s => s.id));
  const baseIds: Set<string> = isAuthenticated ? apiIds : offlineIds;

  // When user logs in, push any offline bookmarks to the API then clear them
  useEffect(() => {
    if (!isAuthenticated) return;
    const offline = loadOffline();
    if (offline.size === 0) return;
    void Promise.all(
      [...offline].map(id => api.registrations.register(id).catch(() => null)),
    ).then(() => {
      localStorage.removeItem(OFFLINE_KEY);
      setOfflineIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    });
  }, [isAuthenticated, queryClient]);

  const registerMutation = useMutation({
    mutationFn: (id: string) => api.registrations.register(id),
    onSettled: (_data, _err, id) => {
      setOptimistic(prev => { const n = new Map(prev); n.delete(id); return n; });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.registrations.cancel(id),
    onSettled: (_data, _err, id) => {
      setOptimistic(prev => { const n = new Map(prev); n.delete(id); return n; });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  function toggle(id: string) {
    const current = optimistic.has(id) ? optimistic.get(id)! : baseIds.has(id);
    const next = !current;

    if (isAuthenticated) {
      setOptimistic(prev => new Map(prev).set(id, next));
      next ? registerMutation.mutate(id) : cancelMutation.mutate(id);
    } else {
      setOfflineIds(prev => {
        const updated = new Set(prev);
        next ? updated.add(id) : updated.delete(id);
        localStorage.setItem(OFFLINE_KEY, JSON.stringify([...updated]));
        return updated;
      });
    }
  }

  function isBookmarked(id: string): boolean {
    if (optimistic.has(id)) return optimistic.get(id)!;
    return baseIds.has(id);
  }

  function isPendingFor(id: string): boolean {
    return optimistic.has(id);
  }

  return (
    <BookmarksContext.Provider value={{ isBookmarked, toggle, isPendingFor }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarksProvider');
  return ctx;
}
