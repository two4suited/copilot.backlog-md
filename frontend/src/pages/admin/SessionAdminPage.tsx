import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import type { Session } from '../../types';

export function SessionAdminPage() {
  const queryClient = useQueryClient();
  const { toast, showToast, clearToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: sessions, isLoading, error } = useQuery<Session[]>({
    queryKey: ['admin', 'sessions'],
    queryFn: () => api.sessions.listAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.sessions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] });
      setDeleteId(null);
      showToast('Session deleted successfully');
    },
    onError: () => {
      setDeleteId(null);
      showToast('Failed to delete session', 'error');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load sessions" />;

  const toDelete = sessions?.find(s => s.id === deleteId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-primary">Sessions</h1>
        <Link
          to="/admin/sessions/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Session
        </Link>
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-bg">
              <th className="text-left px-4 py-3 font-semibold text-brand-muted">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-brand-muted">Track</th>
              <th className="text-left px-4 py-3 font-semibold text-brand-muted">Start Time</th>
              <th className="text-left px-4 py-3 font-semibold text-brand-muted">Room</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sessions?.map((session, idx) => (
              <tr key={session.id} className={`border-b border-brand-border last:border-0 hover:bg-brand-border/20 transition-colors ${idx % 2 === 1 ? 'bg-brand-bg/50' : 'bg-brand-surface'}`}>
                <td className="px-4 py-3 font-medium text-brand-primary">{session.title}</td>
                <td className="px-4 py-3 text-brand-muted">{session.track?.name ?? ''}</td>
                <td className="px-4 py-3 text-brand-muted">
                  {new Date(session.startTime).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-brand-muted">{session.room}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/admin/sessions/${session.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-border text-brand-muted text-xs font-medium hover:bg-brand-accent/10 hover:border-brand-accent hover:text-brand-accent transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(session.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sessions?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No sessions yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Session"
        message={<>Are you sure you want to delete <strong>{toDelete?.title}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isPending={deleteMutation.isPending}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
