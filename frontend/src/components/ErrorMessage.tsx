interface ErrorMessageProps { message?: string; }
export function ErrorMessage({ message = 'Something went wrong.' }: ErrorMessageProps) {
  return (
    <div className="text-center py-20">
      <p className="text-lg font-medium text-red-600">{message}</p>
      <p className="mt-2 text-sm text-slate-500">Please try again later.</p>
    </div>
  );
}
