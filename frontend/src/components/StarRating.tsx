interface StarRatingProps {
  value: number;
  onChange?: (stars: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const cls = sizes[size];

  return (
    <div className="flex items-center gap-0.5" role={readonly ? undefined : 'radiogroup'} aria-label="Star rating">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            role={readonly ? undefined : 'radio'}
            aria-checked={filled}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={[
              cls,
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform',
              filled ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600',
            ].join(' ')}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
