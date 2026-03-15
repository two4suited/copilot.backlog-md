import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import type { Conference } from '../../types';

function toDateInput(dt: string) {
  return dt ? new Date(dt).toISOString().slice(0, 10) : '';
}

interface FormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  websiteUrl: string;
}

interface FormErrors {
  name?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export function ConferenceFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast, showToast, clearToast } = useToast();

  const [form, setForm] = useState<FormData>({
    name: '', description: '', startDate: '', endDate: '', location: '', websiteUrl: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: conference, isLoading } = useQuery<Conference>({
    queryKey: ['conference', id],
    queryFn: () => api.conferences.get(id!),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (conference) {
      setForm({
        name: conference.name,
        description: conference.description ?? '',
        startDate: toDateInput(conference.startDate),
        endDate: toDateInput(conference.endDate),
        location: conference.location,
        websiteUrl: conference.websiteUrl ?? '',
      });
    }
  }, [conference]);

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        name: data.name,
        description: data.description || null,
        startDate: data.startDate ? data.startDate + 'T00:00:00Z' : '',
        endDate: data.endDate ? data.endDate + 'T00:00:00Z' : '',
        location: data.location,
        websiteUrl: data.websiteUrl || null,
      };
      return isNew ? api.conferences.create(payload) : api.conferences.update(id!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'conferences'] });
      showToast(isNew ? 'Conference created' : 'Conference updated');
      setTimeout(() => navigate('/admin/conferences'), 1200);
    },
    onError: () => {
      showToast('Failed to save conference', 'error');
    },
  });

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) saveMutation.mutate(form);
  }

  if (!isNew && isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/conferences" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ChevronLeft className="w-4 h-4" />
        Back to Conferences
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isNew ? 'New Conference' : conference?.name ? `Edit Conference: ${conference.name}` : 'Edit Conference'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.startDate ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
            <input
              type="date"
              value={form.endDate}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.endDate ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
          <input
            type="text"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.location ? 'border-red-400' : 'border-slate-200'}`}
          />
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
          <input
            type="url"
            value={form.websiteUrl}
            onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/admin/conferences" className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : isNew ? 'Create Conference' : 'Save Changes'}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
