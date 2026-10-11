import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles } from './icons.js';
import { useToastStore, type ToastItem, type ToastType } from '../store/toastStore.js';

const toastStyles: Record<ToastType, { border: string; bg: string; iconColor: string }> = {
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  error: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    iconColor: 'text-red-500',
  },
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  info: {
    border: 'border-tg-button/30',
    bg: 'bg-tg-button/10',
    iconColor: 'text-tg-button',
  },
};

export function ToastNotificationItem({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { type, message, title, durationMs = 3200, id } = toast;
  const style = toastStyles[type];

  useEffect(() => {
    if (durationMs <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [id, durationMs, onDismiss]);

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-center justify-between w-full max-w-sm gap-3 px-4 py-3 rounded-2xl bg-tg-section border ${style.border} shadow-xl backdrop-blur-md animate-toast-in`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`p-1.5 rounded-xl ${style.bg} ${style.iconColor} shrink-0`}>
          {type === 'success' && <CheckCircle2 className="w-4 h-4" />}
          {type === 'error' && <AlertCircle className="w-4 h-4" />}
          {type === 'warning' && <AlertCircle className="w-4 h-4" />}
          {type === 'info' && <Sparkles className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          {title && <p className="text-xs font-bold text-tg-text truncate">{title}</p>}
          <p className="text-xs text-tg-text font-medium leading-relaxed truncate">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="p-1 rounded-full text-tg-hint hover:text-tg-text hover:bg-tg-secondary-bg transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
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
      className="fixed top-[max(12px,var(--app-safe-top))] left-0 right-0 z-50 pointer-events-none flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <ToastNotificationItem
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
}
