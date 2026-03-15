interface ErrorMessageProps { message?: string; }
export function ErrorMessage({ message = 'Something went wrong.' }: ErrorMessageProps) {
  return (
    <div className="text-center py-20">
      <p className="text-lg font-medium text-red-600 dark:text-red-400">{message}</p>
      <p className="mt-2 text-sm text-brand-muted dark:text-[#c4a882]">Please try again later.</p>
    </div>
  );
}
