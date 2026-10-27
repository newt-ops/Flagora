import { useEffect, useRef } from 'react';

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  shape: 'rect' | 'circle' | 'strip';
}

const CONFETTI_COLORS = [
  '#2481cc',
  '#38bdf8',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#fbbf24',
];

export function createConfettiParticles(
  count: number,
  width: number,
  height: number,
): ConfettiParticle[] {
  const particles: ConfettiParticle[] = [];
  const originLeft = width * 0.2;
  const originRight = width * 0.8;

  for (let i = 0; i < count; i++) {
    const isLeft = i % 2 === 0;
    const originX = isLeft ? originLeft : originRight;
    const originY = height * 0.25;
    const angle = isLeft
      ? -Math.PI / 4 + (Math.random() - 0.5) * 0.7
      : (-3 * Math.PI) / 4 + (Math.random() - 0.5) * 0.7;
    const speed = 7 + Math.random() * 9;
    const shapeRandom = Math.random();
    const shape = shapeRandom > 0.6 ? 'rect' : shapeRandom > 0.3 ? 'circle' : 'strip';

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed * (isLeft ? 1 : -1),
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.05 + Math.random() * 0.07,
      shape,
    });
  }

  return particles;
}

export function ConfettiCanvas({
  active = true,
  durationMs = 3000,
}: {
  active?: boolean;
  durationMs?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles = createConfettiParticles(75, width, height);
    const startTime = performance.now();
    let animFrameId: number;

    const render = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed >= durationMs) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const remainingProgress = 1 - elapsed / durationMs;
      const opacity = remainingProgress < 0.3 ? remainingProgress / 0.3 : 1;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.vx *= 0.985;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        const wobbleX = p.x + Math.sin(p.wobble) * 4;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(wobbleX, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'strip') {
          ctx.fillRect(-p.size / 4, -p.size, p.size / 2, p.size * 2);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [active, durationMs]);

  if (!active) {
    return null;
  }

  return (
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50 h-full w-full" />
  );
}
