import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  isPending?: boolean;
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Delete', isPending = false }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="bg-brand-surface dark:bg-[#2c1810] rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
          <h2 id="confirm-dialog-title" className="text-lg font-semibold text-brand-primary dark:text-[#f5f0eb]">{title}</h2>
        </div>
        <div className="mt-3 text-brand-muted dark:text-[#c4a882] text-sm">{message}</div>
        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onCancel} disabled={isPending} className="px-4 py-2 rounded-lg border border-brand-border dark:border-[#4a2e20] text-brand-primary dark:text-[#f5f0eb] text-sm font-medium hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isPending} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
            {isPending ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
