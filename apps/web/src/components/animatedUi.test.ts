import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  easeOutExpo,
  calculateInterpolatedCount,
} from './AnimatedCounter.js';
import {
  createConfettiParticles,
} from './ConfettiCanvas.js';

describe('Animated UI logic and math', () => {
  describe('AnimatedCounter easing functions', () => {
    it('returns exact boundary values for easeOutExpo', () => {
      assert.equal(easeOutExpo(0), 0);
      assert.equal(easeOutExpo(1), 1);
    });

    it('produces monotonically increasing values between 0 and 1', () => {
      const p1 = easeOutExpo(0.2);
      const p2 = easeOutExpo(0.5);
      const p3 = easeOutExpo(0.8);

      assert.ok(p1 > 0 && p1 < p2);
      assert.ok(p2 < p3);
      assert.ok(p3 < 1);
    });

    it('interpolates integer count values accurately', () => {
      const start = 0;
      const target = 1500;

      const atZero = calculateInterpolatedCount(start, target, 0);
      assert.equal(atZero, 0);

      const atHalf = calculateInterpolatedCount(start, target, 0.5);
      assert.ok(atHalf > 1000);
      assert.ok(atHalf < 1500);

      const atFull = calculateInterpolatedCount(start, target, 1);
      assert.equal(atFull, 1500);
    });

    it('handles count interpolation when start equals target', () => {
      assert.equal(calculateInterpolatedCount(250, 250, 0.5), 250);
    });
  });

  describe('ConfettiCanvas particle generator', () => {
    it('generates the exact requested number of particles', () => {
      const particles = createConfettiParticles(50, 800, 600);
      assert.equal(particles.length, 50);
    });

    it('initializes particles with valid coordinates, velocities, and shapes', () => {
      const particles = createConfettiParticles(20, 1000, 800);

      for (const p of particles) {
        assert.ok(typeof p.x === 'number' && !Number.isNaN(p.x));
        assert.ok(typeof p.y === 'number' && !Number.isNaN(p.y));
        assert.ok(typeof p.vx === 'number' && !Number.isNaN(p.vx));
        assert.ok(typeof p.vy === 'number' && !Number.isNaN(p.vy));
        assert.ok(p.size > 0);
        assert.ok(['rect', 'circle', 'strip'].includes(p.shape));
        assert.ok(p.color.startsWith('#'));
      }
    });

    it('distributes origin points between left and right sides', () => {
      const particles = createConfettiParticles(10, 1000, 800);
      const leftOrigins = particles.filter((p) => p.x === 200);
      const rightOrigins = particles.filter((p) => p.x === 800);

      assert.equal(leftOrigins.length, 5);
      assert.equal(rightOrigins.length, 5);
    });
  });
});
