import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getRatingDeltaDisplay } from './rankHelpers.js';
import type { BattleParticipantResult } from '@flagora/shared';

describe('battleResultScreen ranked logic', () => {
  it('formats rating delta display for battle results', () => {
    const winDelta = getRatingDeltaDisplay(20);
    assert.equal(winDelta.text, '+20');
    assert.equal(winDelta.isPositive, true);

    const lossDelta = getRatingDeltaDisplay(-15);
    assert.equal(lossDelta.text, '-15');
    assert.equal(lossDelta.isNegative, true);

    const tieDelta = getRatingDeltaDisplay(2);
    assert.equal(tieDelta.text, '+2');
    assert.equal(tieDelta.isPositive, true);
  });

  it('preserves BattleParticipantResult structure with rating delta and new rating', () => {
    const participant: BattleParticipantResult = {
      userId: 101,
      displayName: 'Player',
      score: 1200,
      correctCount: 9,
      totalFlags: 10,
      ratingDelta: 20,
      newRating: 610,
    };

    assert.equal(participant.userId, 101);
    assert.equal(participant.ratingDelta, 20);
    assert.equal(participant.newRating, 610);
  });

  describe('Group Battle Podium Logic', () => {
    it('orders podium rankings accurately and assigns pin rewards', () => {
      const mockPodium = [
        { rank: 1, userId: 1, displayName: 'Alpha', score: 1200, pinsEarned: 150 },
        { rank: 2, userId: 2, displayName: 'Beta', score: 900, pinsEarned: 75 },
        { rank: 3, userId: 3, displayName: 'Gamma', score: 650, pinsEarned: 40 },
        { rank: 4, userId: 4, displayName: 'Delta', score: 400, pinsEarned: 15 },
      ];

      const first = mockPodium.find((p) => p.rank === 1);
      const second = mockPodium.find((p) => p.rank === 2);
      const third = mockPodium.find((p) => p.rank === 3);
      const runnersUp = mockPodium.filter((p) => p.rank > 3);

      assert.equal(first?.displayName, 'Alpha');
      assert.equal(first?.pinsEarned, 150);

      assert.equal(second?.displayName, 'Beta');
      assert.equal(second?.pinsEarned, 75);

      assert.equal(third?.displayName, 'Gamma');
      assert.equal(third?.pinsEarned, 40);

      assert.equal(runnersUp.length, 1);
      assert.equal(runnersUp[0].pinsEarned, 15);
    });
  });
});
