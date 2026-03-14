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
          ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
          : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {bookmarked
        ? <BookmarkCheck className="w-4 h-4" />
        : <Bookmark className="w-4 h-4" />
      }
    </button>
  );
}
