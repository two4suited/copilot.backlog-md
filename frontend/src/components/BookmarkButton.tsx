import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '../context/BookmarksContext';

interface BookmarkButtonProps {
  sessionId: string;
  className?: string;
}

export function BookmarkButton({ sessionId, className = '' }: BookmarkButtonProps) {
  const { isBookmarked, toggle, isPendingFor } = useBookmarks();
  const bookmarked = isBookmarked(sessionId);
  const pending = isPendingFor(sessionId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(sessionId);
      }}
      disabled={pending}
      aria-label={bookmarked ? 'Remove from schedule' : 'Add to schedule'}
      className={`p-1.5 rounded-lg transition-colors ${
        bookmarked
          ? 'text-brand-accent bg-brand-accent/10 hover:bg-brand-accent/20'
          : 'text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {bookmarked
        ? <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
        : <Bookmark className="w-4 h-4" aria-hidden="true" />
      }
    </button>
  );
}
