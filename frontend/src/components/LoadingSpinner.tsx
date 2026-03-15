export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20" data-testid="loading-spinner">
      <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
