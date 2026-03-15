import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import type { Speaker } from '../../types';

interface FormData {
  name: string;
  bio: string;
  email: string;
  company: string;
  photoUrl: string;
  twitterHandle: string;
  linkedInUrl: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

export function SpeakerFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast, showToast, clearToast } = useToast();

  const [form, setForm] = useState<FormData>({
    name: '', bio: '', email: '', company: '', photoUrl: '', twitterHandle: '', linkedInUrl: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: speaker, isLoading } = useQuery<Speaker>({
    queryKey: ['speaker', id],
    queryFn: () => api.speakers.get(id!),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (speaker) {
      setForm({
        name: speaker.name,
        bio: speaker.bio ?? '',
        email: speaker.email,
        company: speaker.company,
        photoUrl: speaker.photoUrl ?? '',
        twitterHandle: speaker.twitterHandle ?? '',
        linkedInUrl: speaker.linkedInUrl ?? '',
      });
    }
  }, [speaker]);

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      if (isNew) {
        return api.speakers.create({
          name: data.name,
          bio: data.bio,
          email: data.email,
          company: data.company,
          photoUrl: data.photoUrl || null,
          twitterHandle: data.twitterHandle || null,
          linkedInUrl: data.linkedInUrl || null,
        });
      } else {
        return api.speakers.update(id!, {
          name: data.name,
          bio: data.bio,
          company: data.company,
          photoUrl: data.photoUrl || null,
          twitterHandle: data.twitterHandle || null,
          linkedInUrl: data.linkedInUrl || null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'speakers'] });
      queryClient.invalidateQueries({ queryKey: ['speakers'] }); // also refresh session form picker
      showToast(isNew ? 'Speaker created' : 'Speaker updated');
      setTimeout(() => navigate('/admin/speakers'), 1200);
    },
    onError: () => {
      showToast('Failed to save speaker', 'error');
    },
  });

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (isNew && !form.email.trim()) errs.email = 'Email is required';
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
      <Link to="/admin/speakers" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ChevronLeft className="w-4 h-4" />
        Back to Speakers
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isNew ? 'New Speaker' : speaker?.name ? `Edit Speaker: ${speaker.name}` : 'Edit Speaker'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-brand-border p-6 space-y-5">
        <div>
          <label htmlFor="speaker-name" className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <input
            id="speaker-name"
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.name ? 'border-red-400' : 'border-brand-border'}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="speaker-email" className="block text-sm font-medium text-slate-700 mb-1">Email {isNew ? '*' : ''}</label>
          <input
            id="speaker-email"
            type="email"
            value={form.email}
            disabled={!isNew}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.email ? 'border-red-400' : 'border-brand-border'} ${!isNew ? 'bg-brand-bg text-brand-muted cursor-not-allowed' : ''}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          {!isNew && <p className="mt-1 text-xs text-slate-400">Email cannot be changed after creation</p>}
        </div>

        <div>
          <label htmlFor="speaker-company" className="block text-sm font-medium text-slate-700 mb-1">Company</label>
          <input
            id="speaker-company"
            type="text"
            value={form.company}
            onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>

        <div>
          <label htmlFor="speaker-bio" className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
          <textarea
            id="speaker-bio"
            rows={4}
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>

        <div>
          <label htmlFor="speaker-photo-url" className="block text-sm font-medium text-slate-700 mb-1">Photo URL</label>
          <input
            id="speaker-photo-url"
            type="url"
            value={form.photoUrl}
            onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="speaker-twitter" className="block text-sm font-medium text-slate-700 mb-1">Twitter Handle</label>
            <input
              id="speaker-twitter"
              type="text"
              value={form.twitterHandle}
              onChange={e => setForm(f => ({ ...f, twitterHandle: e.target.value }))}
              placeholder="@username"
              className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
          <div>
            <label htmlFor="speaker-linkedin-url" className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
            <input
              id="speaker-linkedin-url"
              type="url"
              value={form.linkedInUrl}
              onChange={e => setForm(f => ({ ...f, linkedInUrl: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/admin/speakers" className="px-4 py-2 rounded-lg border border-brand-border text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : isNew ? 'Create Speaker' : 'Save Changes'}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
