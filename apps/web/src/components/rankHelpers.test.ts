import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatSeasonName,
  getRatingDeltaDisplay,
} from './rankHelpers.js';

describe('rankHelpers', () => {
  describe('formatSeasonName', () => {
    it('correctly formats valid YYYY-MM strings to Full Month Name and Year', () => {
      assert.equal(formatSeasonName('2026-09'), 'September 2026');
      assert.equal(formatSeasonName('2026-01'), 'January 2026');
      assert.equal(formatSeasonName('2026-12'), 'December 2026');
      assert.equal(formatSeasonName('2025-05'), 'May 2025');
    });

    it('falls back to current UTC month and year when string is null, undefined, or invalid', () => {
      const fallback = formatSeasonName(null);
      assert.match(fallback, /^[A-Z][a-z]+ \d{4}$/);

      const fallbackUndefined = formatSeasonName(undefined);
      assert.match(fallbackUndefined, /^[A-Z][a-z]+ \d{4}$/);

      const fallbackInvalid = formatSeasonName('invalid-season');
      assert.match(fallbackInvalid, /^[A-Z][a-z]+ \d{4}$/);
    });
  });

  describe('getRatingDeltaDisplay', () => {
    it('formats positive deltas with leading plus sign and tg-button color', () => {
      const res = getRatingDeltaDisplay(20);
      assert.equal(res.text, '+20');
      assert.equal(res.colorClass, 'text-tg-button');
      assert.equal(res.isPositive, true);
      assert.equal(res.isNegative, false);

      const tieRes = getRatingDeltaDisplay(2);
      assert.equal(tieRes.text, '+2');
      assert.equal(tieRes.isPositive, true);
    });

    it('formats negative deltas with red color', () => {
      const res = getRatingDeltaDisplay(-15);
      assert.equal(res.text, '-15');
      assert.equal(res.colorClass, 'text-tg-destructive');
      assert.equal(res.isPositive, false);
      assert.equal(res.isNegative, true);
    });

    it('formats 0 or missing delta neutrally', () => {
      const zeroRes = getRatingDeltaDisplay(0);
      assert.equal(zeroRes.text, '0');
      assert.equal(zeroRes.colorClass, 'text-tg-hint');
      assert.equal(zeroRes.isPositive, false);

      const nullRes = getRatingDeltaDisplay(null);
      assert.equal(nullRes.text, '0');

      const undefRes = getRatingDeltaDisplay(undefined);
      assert.equal(undefRes.text, '0');
    });
  });
});
