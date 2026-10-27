import { useState, type ReactNode } from 'react';
import { AnimatedModal } from './AnimatedModal.js';
import { AnimatedIcon, type AnimatedIconType } from './AnimatedIcon.js';
import { Loader2 } from './icons.js';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  iconType?: AnimatedIconType;
  isLoading?: boolean;
  details?: ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  iconType,
  isLoading: externalLoading = false,
  details,
}: ConfirmationModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  const resolvedIconType: AnimatedIconType =
    iconType || (variant === 'danger' ? 'error' : variant === 'primary' ? 'success' : 'warning');

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-tg-button hover:opacity-95 text-tg-button-text';

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      showCloseButton={!loading}
      closeOnBackdropClick={!loading}
      maxWidthClass="max-w-sm"
      ariaLabel={title}
      footer={
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-tg-secondary-bg hover:opacity-90 active:scale-[0.98] text-tg-text font-semibold text-sm transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleConfirm()}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${confirmButtonClass}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center pt-2 pb-1">
        <AnimatedIcon type={resolvedIconType} size="lg" className="mb-3.5" />
        <h3 className="text-base sm:text-lg font-bold text-tg-text leading-snug">{title}</h3>
        <p className="text-xs sm:text-sm text-tg-hint mt-1.5 max-w-xs leading-relaxed">
          {description}
        </p>

        {details && (
          <div className="w-full mt-4 p-3 rounded-2xl bg-tg-secondary-bg/80 text-xs text-tg-text font-medium">
            {details}
          </div>
        )}
      </div>
    </AnimatedModal>
  );
}
