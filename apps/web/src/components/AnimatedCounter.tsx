import { useState, useEffect, useRef } from 'react';

export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function calculateInterpolatedCount(
  start: number,
  target: number,
  progress: number,
): number {
  const eased = easeOutExpo(Math.max(0, Math.min(1, progress)));
  return Math.round(start + (target - start) * eased);
}

export function AnimatedCounter({
  value,
  durationMs = 800,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const startValueRef = useRef(0);
  const targetValueRef = useRef(value);

  useEffect(() => {
    const startVal = startValueRef.current;
    const targetVal = value;
    targetValueRef.current = targetVal;

    if (startVal === targetVal) {
      setDisplayValue(targetVal);
      return;
    }

    const startTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const current = calculateInterpolatedCount(startVal, targetVal, progress);

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        startValueRef.current = targetVal;
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      startValueRef.current = targetVal;
    };
  }, [value, durationMs]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
}
