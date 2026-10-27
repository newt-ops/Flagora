import { Sparkles, Trophy, Flame } from './icons.js';

export type AnimatedIconType = 'success' | 'error' | 'warning' | 'reward' | 'trophy' | 'streak';

export type AnimatedIconSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AnimatedIconProps {
  type: AnimatedIconType;
  size?: AnimatedIconSize;
  className?: string;
  ariaLabel?: string;
}

const sizeClasses: Record<AnimatedIconSize, { container: string; icon: string }> = {
  sm: { container: 'w-8 h-8 rounded-xl', icon: 'w-5 h-5' },
  md: { container: 'w-12 h-12 rounded-2xl', icon: 'w-7 h-7' },
  lg: { container: 'w-16 h-16 rounded-3xl', icon: 'w-10 h-10' },
  xl: { container: 'w-20 h-20 rounded-3xl', icon: 'w-12 h-12' },
};

export function AnimatedIcon({ type, size = 'md', className = '', ariaLabel }: AnimatedIconProps) {
  const { container, icon } = sizeClasses[size];

  if (type === 'success') {
    return (
      <div
        role="img"
        aria-label={ariaLabel || 'Success'}
        className={`flex items-center justify-center bg-emerald-500/15 text-emerald-500 animate-scale-pop shadow-md shadow-emerald-500/10 ${container} ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={icon}
        >
          <polyline points="20 6 9 17 4 12" className="animate-check-draw" />
        </svg>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div
        role="img"
        aria-label={ariaLabel || 'Error'}
        className={`flex items-center justify-center bg-red-500/15 text-red-500 animate-shake-subtle shadow-md shadow-red-500/10 ${container} ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={icon}
        >
          <line x1="18" y1="6" x2="6" y2="18" className="animate-cross-draw" />
          <line x1="6" y1="6" x2="18" y2="18" className="animate-cross-draw" />
        </svg>
      </div>
    );
  }

  if (type === 'warning') {
    return (
      <div
        role="img"
        aria-label={ariaLabel || 'Warning'}
        className={`flex items-center justify-center bg-amber-500/15 text-amber-500 animate-pulse-glow shadow-md shadow-amber-500/10 ${container} ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={icon}
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
        </svg>
      </div>
    );
  }

  if (type === 'reward') {
    return (
      <div
        role="img"
        aria-label={ariaLabel || 'Reward'}
        className={`relative flex items-center justify-center bg-amber-400/20 text-amber-500 animate-coin-flip shadow-lg shadow-amber-400/20 ${container} ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={icon}
        >
          <circle cx="12" cy="12" r="9" className="fill-amber-400/20" />
          <path d="M12 7v10" strokeWidth="2.5" />
          <path d="M15 9.5a2.5 2.5 0 0 0-5 0c0 2 5 1.5 5 3.5a2.5 2.5 0 0 1-5 0" strokeWidth="2.5" />
        </svg>
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-float" />
      </div>
    );
  }

  if (type === 'trophy') {
    return (
      <div
        role="img"
        aria-label={ariaLabel || 'Victory Trophy'}
        className={`relative flex items-center justify-center bg-yellow-400/20 text-yellow-500 animate-float shadow-lg shadow-yellow-500/20 ${container} ${className}`}
      >
        <Trophy className={icon} />
        <Sparkles className="absolute -top-1.5 -left-1.5 w-4 h-4 text-yellow-400 animate-pulse-glow" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel || 'Active Streak'}
      className={`flex items-center justify-center bg-orange-500/20 text-orange-500 animate-flame-flicker shadow-md shadow-orange-500/15 ${container} ${className}`}
    >
      <Flame className={`${icon} fill-current`} />
    </div>
  );
}
