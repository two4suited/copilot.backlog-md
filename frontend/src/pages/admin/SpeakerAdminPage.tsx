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
import type { Speaker } from '../../types';

export function SpeakerAdminPage() {
  const queryClient = useQueryClient();
  const { toast, showToast, clearToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: speakers, isLoading, error } = useQuery<Speaker[]>({
    queryKey: ['admin', 'speakers'],
    queryFn: () => api.speakers.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.speakers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'speakers'] });
      setDeleteId(null);
      showToast('Speaker deleted successfully');
    },
    onError: () => {
      setDeleteId(null);
      showToast('Failed to delete speaker', 'error');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load speakers" />;

  const toDelete = speakers?.find(s => s.id === deleteId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Speakers</h1>
        <Link
          to="/admin/speakers/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Speaker
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Company</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {speakers?.map(speaker => (
              <tr key={speaker.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{speaker.name}</td>
                <td className="px-4 py-3 text-slate-600">{speaker.company}</td>
                <td className="px-4 py-3 text-slate-600">{speaker.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/admin/speakers/${speaker.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(speaker.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {speakers?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No speakers yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Speaker"
        message={<>Are you sure you want to delete <strong>{toDelete?.name}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isPending={deleteMutation.isPending}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
