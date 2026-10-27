import { useEffect } from 'react';
import { Check, AlertCircle, Sparkles } from './icons.js';
import { useToastStore, type ToastItem } from '../store/toastStore.js';

export function ToastNotificationItem({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { type, message, title, durationMs = 2800, id } = toast;

  useEffect(() => {
    if (durationMs <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [id, durationMs, onDismiss]);

  const isCopy =
    message.toLowerCase().includes('copied') || message.toLowerCase().includes('clipboard');

  return (
    <div
      role="alert"
      onClick={() => onDismiss(id)}
      className="pointer-events-auto cursor-pointer flex items-center gap-2.5 px-4 py-2 rounded-full bg-tg-section/95 border border-tg-secondary-bg/90 shadow-2xl shadow-black/50 backdrop-blur-2xl transition-all duration-200 active:scale-95 animate-toast-in max-w-[calc(100vw-2rem)] select-none"
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          type === 'error'
            ? 'bg-tg-destructive/20 text-tg-destructive'
            : type === 'warning'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-tg-button/20 text-tg-button'
        }`}
      >
        {isCopy || type === 'success' ? (
          <Check className="h-3 w-3 stroke-[2.5]" />
        ) : type === 'error' ? (
          <AlertCircle className="h-3 w-3 stroke-[2.5]" />
        ) : type === 'warning' ? (
          <AlertCircle className="h-3 w-3 stroke-[2.5]" />
        ) : (
          <Sparkles className="h-3 w-3 stroke-[2.5]" />
        )}
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        {title && <span className="text-xs font-bold text-tg-text truncate shrink-0">{title}</span>}
        <span className="text-xs font-semibold text-tg-text truncate">{message}</span>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-[max(1rem,calc(var(--app-safe-top,0px)+0.75rem))] inset-x-0 z-50 pointer-events-none flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <ToastNotificationItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
