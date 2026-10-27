import { useState } from 'react';
import { Play, Globe, Timer, Flag } from './icons.js';
import { ButtonLoader } from './ButtonLoader.js';
import type { Continent } from '@flagora/shared';
import { CONTINENT_LABELS } from '@flagora/shared';
import { ContinentMap } from './ContinentMap.js';
import { AnimatedModal } from './AnimatedModal.js';

export interface CustomGameConfig {
  continent: Continent;
  flagCount: number;
  durationSeconds: number;
}

interface CustomGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: CustomGameConfig) => void;
  loading?: boolean;
}

export function CustomGameModal({
  isOpen,
  onClose,
  onStart,
  loading = false,
}: CustomGameModalProps) {
  const [continent, setContinent] = useState<Continent>('world');
  const [flagCount, setFlagCount] = useState<number>(10);
  const [durationSeconds, setDurationSeconds] = useState<number>(60);

  const continents: Continent[] = ['world', 'africa', 'asia', 'europe', 'americas', 'oceania'];
  const flagOptions = [10, 20, 30, 50];
  const timerOptions = [30, 60, 90, 120];

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Game Mode"
      description="Customize regions, flags count & timer"
      footer={
        <button
          type="button"
          onClick={() => onStart({ continent, flagCount, durationSeconds })}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-tg-button text-tg-button-text font-bold text-sm shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {loading ? (
            <ButtonLoader className="text-tg-button-text" />
          ) : (
            <Play className="w-4 h-4 fill-current shrink-0" />
          )}
          <span>
            {loading ? 'Starting Game...' : `Start ${flagCount} Flags (${durationSeconds}s)`}
          </span>
        </button>
      }
    >
      <div className="mb-4">
        <label className="text-xs font-semibold text-tg-hint uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-tg-button" />
          Choose Region
        </label>
        <ContinentMap selectedContinent={continent} onSelectContinent={setContinent} />

        <div className="grid grid-cols-3 gap-1.5 mt-3">
          {continents.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setContinent(c)}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all text-center truncate ${
                continent === c
                  ? 'bg-tg-button text-tg-button-text shadow-sm'
                  : 'bg-tg-secondary-bg text-tg-text hover:bg-tg-secondary-bg/80'
              }`}
            >
              {CONTINENT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs font-semibold text-tg-hint uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5 text-tg-button" />
          Number of Flags
        </label>
        <div className="grid grid-cols-4 gap-2">
          {flagOptions.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setFlagCount(count)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                flagCount === count
                  ? 'bg-tg-button text-tg-button-text shadow-sm'
                  : 'bg-tg-secondary-bg text-tg-text hover:bg-tg-secondary-bg/80'
              }`}
            >
              {count} Flags
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <label className="text-xs font-semibold text-tg-hint uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-tg-button" />
          Time Limit
        </label>
        <div className="grid grid-cols-4 gap-2">
          {timerOptions.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setDurationSeconds(sec)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                durationSeconds === sec
                  ? 'bg-tg-button text-tg-button-text shadow-sm'
                  : 'bg-tg-secondary-bg text-tg-text hover:bg-tg-secondary-bg/80'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>
    </AnimatedModal>
  );
}
