import { useEffect, useRef, type ReactNode } from 'react';
import { X } from './icons.js';

export interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  maxWidthClass?: string;
  ariaLabel?: string;
}

export function AnimatedModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnBackdropClick = true,
  showCloseButton = true,
  maxWidthClass = 'max-w-md',
  ariaLabel,
}: AnimatedModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      onClick={() => {
        if (closeOnBackdropClick) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-modal-fade"
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidthClass} rounded-3xl bg-tg-section shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-modal-card`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between pb-2 mb-4">
            <div className="min-w-0 pr-2">
              {title && (
                <h2 className="text-base sm:text-lg font-bold text-tg-text truncate">{title}</h2>
              )}
              {description && <p className="text-xs text-tg-hint mt-0.5 truncate">{description}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-1.5 rounded-full text-tg-hint hover:text-tg-text hover:bg-tg-secondary-bg transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {children && <div className="space-y-4">{children}</div>}

        {footer && <div className="mt-5 pt-2">{footer}</div>}
      </div>
    </div>
  );
}
