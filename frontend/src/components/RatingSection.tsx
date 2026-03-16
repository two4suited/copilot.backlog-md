import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { MyRatingDto, RatingSummaryDto } from '../types';
import { StarRating } from './StarRating';
import { useAuth } from '../context/AuthContext';

interface RatingSectionProps {
  sessionId: string;
  sessionEndTime: string;
  isRegistered: boolean;
}

function SummaryBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-14 text-right text-slate-500 dark:text-[#c4a882] shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-200 dark:bg-[#4a2e20] rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-slate-500 dark:text-[#c4a882] shrink-0">{count}</span>
    </div>
  );
}

export function RatingSection({ sessionId, sessionEndTime, isRegistered }: RatingSectionProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const sessionEnded = new Date(sessionEndTime) < new Date();

  const [pendingStars, setPendingStars] = useState(0);
  const [pendingComment, setPendingComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: summary } = useQuery<RatingSummaryDto>({
    queryKey: ['ratings-summary', sessionId],
    queryFn: () => api.ratings.getSummary(sessionId),
    enabled: sessionEnded,
  });

  const { data: mine } = useQuery<MyRatingDto>({
    queryKey: ['ratings-mine', sessionId],
    queryFn: () => api.ratings.getMine(sessionId),
    enabled: sessionEnded && isAuthenticated,
  });

  // Pre-populate form when an existing rating is loaded
  useEffect(() => {
    if (mine?.hasRated && mine.rating && !submitted) {
      setPendingStars(mine.rating.stars);
      setPendingComment(mine.rating.comment ?? '');
    }
  }, [mine, submitted]);

  const submitMutation = useMutation({
    mutationFn: () => api.ratings.submit(sessionId, pendingStars, pendingComment || undefined),
    onSuccess: () => {
      setFormError(null);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['ratings-summary', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['ratings-mine', sessionId] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setFormError(msg ?? 'Failed to submit rating. Please try again.');
    },
  });

  // Don't render section at all until session has ended
  if (!sessionEnded) return null;

  const dist = summary?.distribution;
  const canRate = isAuthenticated && isRegistered;

  return (
    <section className="mt-10 pt-8 border-t border-brand-border dark:border-[#4a2e20]">
      <h2 className="text-xl font-semibold text-brand-primary dark:text-[#f5f0eb] mb-6">
        Ratings &amp; Feedback
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Aggregate summary */}
        <div>
          {summary && summary.totalRatings > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-slate-900 dark:text-[#f5f0eb]">
                  {summary.averageStars.toFixed(1)}
                </span>
                <div>
                  <StarRating value={Math.round(summary.averageStars)} readonly size="md" />
                  <p className="text-sm text-slate-500 dark:text-[#c4a882] mt-0.5">
                    {summary.totalRatings} {summary.totalRatings === 1 ? 'rating' : 'ratings'}
                  </p>
                </div>
              </div>
              {dist && (
                <div className="space-y-1.5">
                  <SummaryBar label="5 stars" count={dist.fiveStars} total={summary.totalRatings} />
                  <SummaryBar label="4 stars" count={dist.fourStars} total={summary.totalRatings} />
                  <SummaryBar label="3 stars" count={dist.threeStars} total={summary.totalRatings} />
                  <SummaryBar label="2 stars" count={dist.twoStars} total={summary.totalRatings} />
                  <SummaryBar label="1 star" count={dist.oneStar} total={summary.totalRatings} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-[#c4a882] text-sm">No ratings yet.</p>
          )}
        </div>

        {/* Rating form */}
        <div>
          {!isAuthenticated && (
            <p className="text-sm text-slate-500 dark:text-[#c4a882]">
              <a href="/login" className="text-brand-accent hover:underline font-medium">Sign in</a> to leave a rating.
            </p>
          )}

          {isAuthenticated && !isRegistered && (
            <p className="text-sm text-slate-500 dark:text-[#c4a882]">
              Only registered attendees can leave a rating.
            </p>
          )}

          {canRate && (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (pendingStars === 0) {
                  setFormError('Please select a star rating.');
                  return;
                }
                submitMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1.5">
                  {mine?.hasRated ? 'Update your rating' : 'Your rating'}
                </label>
                <StarRating value={pendingStars} onChange={setPendingStars} size="lg" />
              </div>

              <div>
                <label
                  htmlFor="rating-comment"
                  className="block text-sm font-medium text-slate-700 dark:text-[#f5f0eb] mb-1.5"
                >
                  Comment <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="rating-comment"
                  rows={3}
                  maxLength={500}
                  value={pendingComment}
                  onChange={e => setPendingComment(e.target.value)}
                  placeholder="Share your thoughts about this session…"
                  className="block w-full rounded-md border border-slate-300 dark:border-[#4a2e20] bg-white dark:bg-[#2c1810] text-slate-900 dark:text-[#f5f0eb] px-3 py-2 text-sm shadow-sm placeholder-slate-400 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                />
                <p className="mt-1 text-xs text-slate-400 text-right">{pendingComment.length}/500</p>
              </div>

              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}

              {submitted && !submitMutation.isPending && (
                <p className="text-sm text-emerald-600 font-medium">✓ Rating saved!</p>
              )}

              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitMutation.isPending
                  ? 'Saving…'
                  : mine?.hasRated
                    ? 'Update rating'
                    : 'Submit rating'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
