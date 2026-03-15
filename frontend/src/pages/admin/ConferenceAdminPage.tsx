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
import type { Conference } from '../../types';

export function ConferenceAdminPage() {
  const queryClient = useQueryClient();
  const { toast, showToast, clearToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: conferences, isLoading, error } = useQuery<Conference[]>({
    queryKey: ['admin', 'conferences'],
    queryFn: () => api.conferences.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.conferences.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'conferences'] });
      setDeleteId(null);
      showToast('Conference deleted successfully');
    },
    onError: () => {
      setDeleteId(null);
      showToast('Failed to delete conference', 'error');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load conferences" />;

  const toDelete = conferences?.find(c => c.id === deleteId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-primary">Conferences</h1>
        <Link
          to="/admin/conferences/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Conference
        </Link>
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-bg">
              <th className="text-left px-4 py-3 font-semibold text-brand-muted">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-brand-muted">Location</th>
              <th className="text-left px-4 py-3 font-semibold text-brand-muted">Dates</th>
              <th className="text-left px-4 py-3 font-semibold text-brand-muted">Tracks</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {conferences?.map((conference, idx) => (
              <tr key={conference.id} className={`border-b border-brand-border last:border-0 hover:bg-brand-border/20 transition-colors ${idx % 2 === 1 ? 'bg-brand-bg/50' : 'bg-brand-surface'}`}>
                <td className="px-4 py-3 font-medium text-brand-primary">{conference.name}</td>
                <td className="px-4 py-3 text-brand-muted">{conference.location}</td>
                <td className="px-4 py-3 text-brand-muted">
                  {new Date(conference.startDate).toLocaleDateString()} – {new Date(conference.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-brand-muted">{conference.trackCount}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/admin/conferences/${conference.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-border text-brand-muted text-xs font-medium hover:bg-brand-accent/10 hover:border-brand-accent hover:text-brand-accent transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(conference.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {conferences?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No conferences yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Conference"
        message={<>Are you sure you want to delete <strong>{toDelete?.name}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isPending={deleteMutation.isPending}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
