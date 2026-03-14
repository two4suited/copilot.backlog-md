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
        <h1 className="text-2xl font-bold text-slate-900">Conferences</h1>
        <Link
          to="/admin/conferences/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Conference
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Location</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Dates</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Tracks</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {conferences?.map(conference => (
              <tr key={conference.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{conference.name}</td>
                <td className="px-4 py-3 text-slate-600">{conference.location}</td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(conference.startDate).toLocaleDateString()} – {new Date(conference.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-600">{conference.trackCount}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/admin/conferences/${conference.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
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
