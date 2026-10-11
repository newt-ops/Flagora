import { useEffect } from 'react';
import { AnimatedModal } from './AnimatedModal.js';
import { AnimatedIcon, type AnimatedIconType } from './AnimatedIcon.js';
import { AnimatedCounter } from './AnimatedCounter.js';
import { ConfettiCanvas } from './ConfettiCanvas.js';
import { Coins, Zap, Trophy, Award } from './icons.js';
import { triggerHaptic } from '../telegram/haptics.js';

export type RewardType = 'pins' | 'xp' | 'badge' | 'trophy' | 'achievement';

export interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  amount?: number;
  amountLabel?: string;
  rewardType?: RewardType;
  badgeName?: string;
  confetti?: boolean;
  buttonText?: string;
}

export function RewardModal({
  isOpen,
  onClose,
  title,
  subtitle,
  amount,
  amountLabel,
  rewardType = 'pins',
  badgeName,
  confetti = true,
  buttonText = 'Claim Reward',
}: RewardModalProps) {
  useEffect(() => {
    if (isOpen) {
      triggerHaptic('success');
    }
  }, [isOpen]);

  const resolvedIconType: AnimatedIconType =
    rewardType === 'trophy' || rewardType === 'badge' || rewardType === 'achievement'
      ? 'trophy'
      : rewardType === 'xp'
        ? 'streak'
        : 'reward';

  return (
    <>
      {isOpen && confetti && <ConfettiCanvas durationMs={3500} />}

      <AnimatedModal
        isOpen={isOpen}
        onClose={onClose}
        showCloseButton={false}
        closeOnBackdropClick={false}
        maxWidthClass="max-w-sm"
        ariaLabel={title}
        footer={
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-tg-button text-tg-button-text font-bold text-base shadow-lg shadow-tg-button/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            {buttonText}
          </button>
        }
      >
        <div className="relative flex flex-col items-center text-center pt-2 pb-2 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <svg
              viewBox="0 0 200 200"
              className="w-48 h-48 animate-rays-rotate text-amber-400"
              fill="currentColor"
            >
              <polygon points="100,100 90,0 110,0" />
              <polygon points="100,100 160,20 180,40" />
              <polygon points="100,100 200,90 200,110" />
              <polygon points="100,100 180,160 160,180" />
              <polygon points="100,100 110,200 90,200" />
              <polygon points="100,100 40,180 20,160" />
              <polygon points="100,100 0,110 0,90" />
              <polygon points="100,100 20,40 40,20" />
            </svg>
          </div>

          <AnimatedIcon type={resolvedIconType} size="xl" className="relative z-10 mb-3" />

          <h3 className="relative z-10 text-xl font-black text-tg-text tracking-tight">
            {title}
          </h3>

          {subtitle && (
            <p className="relative z-10 text-xs sm:text-sm text-tg-hint mt-1 max-w-xs leading-relaxed">
              {subtitle}
            </p>
          )}

          {amount !== undefined && (
            <div className="relative z-10 mt-4 px-5 py-2.5 rounded-2xl bg-tg-secondary-bg/90 flex items-center gap-2.5 shadow-sm">
              {rewardType === 'pins' && <Coins className="w-5 h-5 text-amber-500 fill-amber-500/20" />}
              {rewardType === 'xp' && <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />}
              {rewardType === 'trophy' && <Trophy className="w-5 h-5 text-amber-500" />}
              {rewardType === 'badge' && <Award className="w-5 h-5 text-tg-button" />}
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-tg-text">
                  +<AnimatedCounter value={amount} durationMs={1200} />
                </span>
                {amountLabel && (
                  <span className="text-xs font-bold text-tg-hint uppercase tracking-wider">
                    {amountLabel}
                  </span>
                )}
              </div>
            </div>
          )}

          {badgeName && (
            <div className="relative z-10 mt-3 px-4 py-1.5 rounded-xl bg-tg-button/15 text-tg-button font-bold text-xs tracking-wide">
              {badgeName}
            </div>
          )}
        </div>
      </AnimatedModal>
    </>
  );
}
