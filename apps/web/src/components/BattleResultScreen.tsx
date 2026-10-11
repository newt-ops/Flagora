import { useState } from 'react';
import { Trophy, Swords, ArrowLeft, Share2, Crown, Medal, Award, Coins, Loader2 } from './icons.js';
import type { BattleFinishedPayload, BattleInfoResponse, GroupPodiumItem } from '@flagora/shared';
import {
  getBattleViewerPerspective,
  getBattlePerspectiveHeading,
  getInitials,
  formatGroupVictoryShareText,
  format1v1VictoryShareText,
  getBattleDeepLink,
} from './battleHelpers.js';
import { getRatingDeltaDisplay } from './rankHelpers.js';
import { ConfettiCanvas } from './ConfettiCanvas.js';
import { AnimatedCounter } from './AnimatedCounter.js';

interface BattleResultScreenProps {
  battleId: string;
  finishedPayload?: BattleFinishedPayload | null;
  battleInfo?: BattleInfoResponse | null;
  currentUserId: number;
  onBattleAgain: () => void;
  onBackToProfile: () => void;
  isStartingBattleAgain?: boolean;
  groupPodium?: GroupPodiumItem[] | null;
}

export function BattleResultScreen({
  battleId,
  finishedPayload,
  battleInfo,
  currentUserId,
  onBattleAgain,
  onBackToProfile,
  isStartingBattleAgain = false,
  groupPodium,
}: BattleResultScreenProps) {
  const [copiedShare, setCopiedShare] = useState(false);

  const isGroup = Boolean(
    groupPodium ||
    battleInfo?.isGroupBattle ||
    (battleInfo?.podium && battleInfo.podium.length > 0)
  );

  const podium = groupPodium || battleInfo?.podium || [];

  const handleShareGroupResults = () => {
    const text = formatGroupVictoryShareText(podium);
    const deepLink = getBattleDeepLink(battleId);
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(text)}`;
    const telegramWebApp = (
      typeof window !== 'undefined'
        ? (window as unknown as { Telegram?: { WebApp?: { openTelegramLink: (url: string) => void } } }).Telegram?.WebApp
        : undefined
    );
    if (typeof telegramWebApp?.openTelegramLink === 'function') {
      telegramWebApp.openTelegramLink(tgUrl);
    } else if (typeof window !== 'undefined' && typeof window.open === 'function') {
      window.open(tgUrl, '_blank');
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  if (isGroup && podium.length > 0) {
    const firstPlace = podium.find((p) => p.rank === 1) || podium[0];
    const secondPlace = podium.find((p) => p.rank === 2) || podium[1];
    const thirdPlace = podium.find((p) => p.rank === 3) || podium[2];
    const runnersUp = podium.filter((p) => p.rank > 3);
    const myResult = podium.find((p) => p.userId === currentUserId);
    const isFirstPlaceMe = myResult?.rank === 1;

    return (
      <div className="flex w-full max-w-md mx-auto flex-col items-center gap-4 text-tg-text">
        {isFirstPlaceMe && <ConfettiCanvas active={true} />}
        <div className="flex w-full flex-col items-center rounded-2xl bg-tg-section p-6 text-center shadow-sm animate-scale-pop">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tg-button/10 text-tg-button ring-1 ring-tg-button/20 shadow-sm animate-float">
            <Trophy className="h-8 w-8" />
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-tg-text">
            Group Battle Finished!
          </h2>
          <p className="mt-1 text-xs text-tg-hint">
            {podium.length} players competed in the arena
          </p>

          {myResult && (
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 rounded-xl bg-tg-secondary-bg px-4 py-2 text-xs font-semibold animate-scale-pop">
              <span className="text-tg-hint">Your Result:</span>
              <span className="flex items-center gap-1 font-bold text-tg-button">
                {myResult.rank === 1 && <Crown className="h-3.5 w-3.5 text-tg-button animate-float" />}
                {myResult.rank === 2 && <Medal className="h-3.5 w-3.5 text-tg-button" />}
                {myResult.rank === 3 && <Award className="h-3.5 w-3.5 text-tg-button" />}
                <span>
                  {myResult.rank === 1
                    ? '1st Place'
                    : myResult.rank === 2
                    ? '2nd Place'
                    : myResult.rank === 3
                    ? '3rd Place'
                    : `#${myResult.rank} Place`}
                </span>
              </span>
              <span className="text-tg-hint">•</span>
              <span className="font-bold text-tg-text">
                <AnimatedCounter value={myResult.score} /> pts
              </span>
              <span className="text-tg-hint">•</span>
              <span className="flex items-center gap-1 font-bold text-tg-button">
                <span>+</span>
                <AnimatedCounter value={myResult.pinsEarned} />
                <Coins className="h-3.5 w-3.5 text-tg-button" />
              </span>
            </div>
          )}

          <div className="mt-6 flex w-full items-end justify-center gap-2 pt-8">
            {secondPlace && (
              <div className="flex flex-1 flex-col items-center animate-podium-second">
                <div className="relative mb-2 flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tg-button/20 text-tg-button">
                    {secondPlace.photoUrl ? (
                      <img
                        src={secondPlace.photoUrl}
                        alt={secondPlace.displayName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">{getInitials(secondPlace.displayName)}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-tg-section text-tg-button shadow-sm ring-1 ring-tg-button/30">
                    <Medal className="h-3 w-3" />
                  </span>
                </div>
                <p className="max-w-[70px] truncate text-[11px] font-bold text-tg-text">
                  {secondPlace.displayName}
                </p>
                <span className="text-[10px] text-tg-hint">{secondPlace.score} pts</span>
                <span className="mt-0.5 flex items-center gap-0.5 text-[9px] font-bold text-tg-button">
                  <span>+{secondPlace.pinsEarned}</span>
                  <Coins className="h-2.5 w-2.5" />
                </span>
                <div className="mt-2 flex h-24 w-full flex-col items-center justify-center rounded-t-xl bg-tg-button/15 border-t border-tg-button/30">
                  <span className="text-xl font-black text-tg-button">2</span>
                </div>
              </div>
            )}

            {firstPlace && (
              <div className="flex flex-1 flex-col items-center animate-podium-first">
                <div className="relative mb-2 flex flex-col items-center">
                  <span className="mb-0.5 text-tg-button animate-float">
                    <Crown className="h-5 w-5" />
                  </span>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tg-button text-tg-button-text ring-2 ring-tg-button ring-offset-2 ring-offset-tg-section animate-pulse-glow">
                    {firstPlace.photoUrl ? (
                      <img
                        src={firstPlace.photoUrl}
                        alt={firstPlace.displayName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-bold">{getInitials(firstPlace.displayName)}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-tg-button text-tg-button-text shadow-sm ring-2 ring-tg-section">
                    <Crown className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="max-w-[80px] truncate text-xs font-bold text-tg-text">
                  {firstPlace.displayName}
                </p>
                <span className="text-[11px] font-bold text-tg-button">{firstPlace.score} pts</span>
                <span className="mt-0.5 flex items-center gap-0.5 text-[10px] font-bold text-tg-button">
                  <span>+{firstPlace.pinsEarned}</span>
                  <Coins className="h-3 w-3" />
                </span>
                <div className="mt-2 flex h-32 w-full flex-col items-center justify-center rounded-t-xl bg-gradient-to-t from-tg-button/25 to-tg-button/15 border-t-2 border-tg-button shadow-sm">
                  <span className="text-2xl font-black text-tg-button">1</span>
                </div>
              </div>
            )}

            {thirdPlace && (
              <div className="flex flex-1 flex-col items-center animate-podium-third">
                <div className="relative mb-2 flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tg-button/10 text-tg-button">
                    {thirdPlace.photoUrl ? (
                      <img
                        src={thirdPlace.photoUrl}
                        alt={thirdPlace.displayName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">{getInitials(thirdPlace.displayName)}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-tg-section text-tg-button shadow-sm ring-1 ring-tg-button/20">
                    <Award className="h-3 w-3" />
                  </span>
                </div>
                <p className="max-w-[70px] truncate text-[11px] font-bold text-tg-text">
                  {thirdPlace.displayName}
                </p>
                <span className="text-[10px] text-tg-hint">{thirdPlace.score} pts</span>
                <span className="mt-0.5 flex items-center gap-0.5 text-[9px] font-bold text-tg-button">
                  <span>+{thirdPlace.pinsEarned}</span>
                  <Coins className="h-2.5 w-2.5" />
                </span>
                <div className="mt-2 flex h-16 w-full flex-col items-center justify-center rounded-t-xl bg-tg-button/10 border-t border-tg-button/20">
                  <span className="text-lg font-black text-tg-button">3</span>
                </div>
              </div>
            )}
          </div>

          {runnersUp.length > 0 && (
            <div className="mt-4 flex w-full flex-col gap-1.5 rounded-xl bg-tg-secondary-bg p-3 animate-slide-up">
              <span className="text-left text-[10px] font-bold uppercase tracking-wider text-tg-hint">
                Other Standings
              </span>
              {runnersUp.map((r) => {
                const isMe = r.userId === currentUserId;
                return (
                  <div
                    key={r.userId}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                      isMe ? 'bg-tg-button/15 font-bold text-tg-button' : 'text-tg-text'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-left text-tg-hint">#{r.rank}</span>
                      <span className="max-w-[140px] truncate">{r.displayName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{r.score} pts</span>
                      <span className="flex items-center gap-0.5 font-bold text-tg-button">
                        <span>+{r.pinsEarned}</span>
                        <Coins className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={handleShareGroupResults}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-tg-button font-bold text-tg-button-text shadow-sm transition-opacity hover:opacity-90 active:opacity-75"
            >
              <Share2 className="h-4 w-4" />
              <span>{copiedShare ? 'Opening Share...' : 'Share Results to Group'}</span>
            </button>

            <button
              type="button"
              onClick={onBackToProfile}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-tg-secondary-bg text-sm font-semibold text-tg-hint transition-colors hover:text-tg-text active:opacity-75"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Profile</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const winner = finishedPayload?.winner || battleInfo?.winner || null;
  const challengerUserId =
    finishedPayload?.challengerResult.userId || battleInfo?.challengerUserId || 0;
  const opponentUserId =
    finishedPayload?.opponentResult.userId || battleInfo?.opponentUserId || 0;

  const perspective = getBattleViewerPerspective(
    {
      winner,
      challengerUserId,
      opponentUserId,
    },
    currentUserId,
  );

  const challengerName =
    finishedPayload?.challengerResult.displayName ||
    battleInfo?.challengerDisplayName ||
    'Challenger';
  const opponentName =
    finishedPayload?.opponentResult.displayName ||
    battleInfo?.opponentDisplayName ||
    'Opponent';

  const heading = getBattlePerspectiveHeading(
    perspective,
    winner === 'challenger' ? challengerName : opponentName,
  );

  const isChallengerViewer = challengerUserId === currentUserId;
  const isOpponentViewer = opponentUserId === currentUserId;

  const challengerWon = winner === 'challenger';
  const opponentWon = winner === 'opponent';

  const challengerPhoto =
    finishedPayload?.challengerResult.photoUrl || battleInfo?.challengerPhotoUrl || null;
  const opponentPhoto =
    finishedPayload?.opponentResult.photoUrl || battleInfo?.opponentPhotoUrl || null;

  const challengerScore =
    finishedPayload?.challengerScore ?? battleInfo?.challengerScore ?? 0;
  const opponentScore =
    finishedPayload?.opponentScore ?? battleInfo?.opponentScore ?? 0;

  const challengerCorrect =
    finishedPayload?.challengerResult.correctCount ??
    battleInfo?.challengerResult?.correctCount ??
    0;
  const challengerTotal =
    finishedPayload?.challengerResult.totalFlags ??
    battleInfo?.challengerResult?.totalFlags ??
    10;

  const opponentCorrect =
    finishedPayload?.opponentResult.correctCount ??
    battleInfo?.opponentResult?.correctCount ??
    0;
  const opponentTotal =
    finishedPayload?.opponentResult.totalFlags ??
    battleInfo?.opponentResult?.totalFlags ??
    10;

  const challengerResult =
    finishedPayload?.challengerResult || battleInfo?.challengerResult || null;
  const opponentResult =
    finishedPayload?.opponentResult || battleInfo?.opponentResult || null;

  const viewerResult = isChallengerViewer
    ? challengerResult
    : isOpponentViewer
    ? opponentResult
    : null;

  const viewerDelta = viewerResult?.ratingDelta !== undefined
    ? getRatingDeltaDisplay(viewerResult.ratingDelta)
    : null;

  const challengerDelta = challengerResult?.ratingDelta !== undefined
    ? getRatingDeltaDisplay(challengerResult.ratingDelta)
    : null;

  const opponentDelta = opponentResult?.ratingDelta !== undefined
    ? getRatingDeltaDisplay(opponentResult.ratingDelta)
    : null;

  const challengerInitial = getInitials(challengerName);
  const opponentInitial = getInitials(opponentName);

  const handleShare1v1Results = () => {
    const deepLink = getBattleDeepLink(battleId);
    const text = challengerWon
      ? format1v1VictoryShareText(challengerName, opponentName, challengerScore, opponentScore, false)
      : opponentWon
      ? format1v1VictoryShareText(opponentName, challengerName, opponentScore, challengerScore, false)
      : format1v1VictoryShareText(challengerName, opponentName, challengerScore, opponentScore, true);
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(text)}`;
    const telegramWebApp = (
      typeof window !== 'undefined'
        ? (window as unknown as { Telegram?: { WebApp?: { openTelegramLink: (url: string) => void } } }).Telegram?.WebApp
        : undefined
    );
    if (typeof telegramWebApp?.openTelegramLink === 'function') {
      telegramWebApp.openTelegramLink(tgUrl);
    } else if (typeof window !== 'undefined' && typeof window.open === 'function') {
      window.open(tgUrl, '_blank');
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const viewerWon = (isChallengerViewer && challengerWon) || (isOpponentViewer && opponentWon);
  const show1v1Confetti = viewerWon;

  return (
    <div className="flex w-full max-w-md mx-auto flex-col items-center gap-4 text-tg-text">
      {show1v1Confetti && <ConfettiCanvas active={true} />}

      <div className="flex w-full flex-col items-center rounded-2xl bg-tg-section p-6 text-center shadow-sm animate-scale-pop">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tg-button/10 text-tg-button ring-1 ring-tg-button/20 shadow-sm animate-float">
          <Trophy className="h-8 w-8" />
        </div>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-tg-text">
          {heading.title}
        </h2>
        <p className="mt-1 text-xs text-tg-hint">{heading.subtitle}</p>

        {viewerResult && viewerDelta && (
          <div
            data-testid="battle-rating-change"
            className="mt-3.5 flex items-center justify-center gap-2 rounded-xl bg-tg-secondary-bg px-3.5 py-1.5 text-xs font-semibold animate-scale-pop"
          >
            <span className="text-tg-hint">Rating:</span>
            <span className="font-bold text-tg-text">
              {viewerResult.newRating !== undefined ? viewerResult.newRating.toLocaleString() : '—'}
            </span>
            <span className={`font-bold ${viewerDelta.colorClass}`}>
              ({viewerDelta.text})
            </span>
          </div>
        )}

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <div
            className={`flex flex-col items-center rounded-xl bg-tg-secondary-bg p-4 transition-all ${
              challengerWon ? 'bg-tg-button/10 ring-1 ring-tg-button/30 shadow-sm animate-pulse-glow' : 'opacity-90'
            }`}
          >
            <div className="relative flex h-16 w-16 items-center justify-center">
              {challengerPhoto ? (
                <img
                  src={challengerPhoto}
                  alt={challengerName}
                  className="h-14 w-14 rounded-full object-cover bg-tg-section"
                />
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-tg-button text-xl font-bold text-tg-button-text"
                >
                  {challengerInitial}
                </div>
              )}
              {challengerWon && (
                <span className="absolute -bottom-1 -right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-tg-button text-tg-button-text shadow-sm ring-2 ring-tg-section animate-float">
                  <Crown className="h-3.5 w-3.5" />
                </span>
              )}
            </div>

            <p className="mt-2.5 max-w-[120px] truncate text-xs font-bold text-tg-text">
              {challengerName}
            </p>
            <p className="text-[11px] text-tg-hint">
              {isChallengerViewer ? 'You' : 'Host'}
            </p>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-tg-text">
                <AnimatedCounter value={challengerScore} />
              </span>
              <span className="text-[11px] font-semibold text-tg-hint">pts</span>
            </div>

            <span className="mt-1 text-[11px] text-tg-hint">
              {challengerCorrect}/{challengerTotal} correct
            </span>

            {challengerDelta && (
              <div className="mt-1.5 flex items-center gap-1 text-xs">
                <span className={`font-bold ${challengerDelta.colorClass}`}>
                  {challengerDelta.text}
                </span>
                <span className="text-[10px] text-tg-hint">RR</span>
              </div>
            )}

            {challengerWon && (
              <span className="mt-2 flex items-center gap-1 rounded-full bg-tg-button/15 px-2.5 py-0.5 text-[10px] font-bold text-tg-button">
                <Crown className="h-2.5 w-2.5" />
                <span>Winner</span>
              </span>
            )}
          </div>

          <div
            className={`flex flex-col items-center rounded-xl bg-tg-secondary-bg p-4 transition-all ${
              opponentWon ? 'bg-tg-button/10 ring-1 ring-tg-button/30 shadow-sm animate-pulse-glow' : 'opacity-90'
            }`}
          >
            <div className="relative flex h-16 w-16 items-center justify-center">
              {opponentPhoto ? (
                <img
                  src={opponentPhoto}
                  alt={opponentName}
                  className="h-14 w-14 rounded-full object-cover bg-tg-section"
                />
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-tg-button text-xl font-bold text-tg-button-text"
                >
                  {opponentInitial}
                </div>
              )}
              {opponentWon && (
                <span className="absolute -bottom-1 -right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-tg-button text-tg-button-text shadow-sm ring-2 ring-tg-section animate-float">
                  <Crown className="h-3.5 w-3.5" />
                </span>
              )}
            </div>

            <p className="mt-2.5 max-w-[120px] truncate text-xs font-bold text-tg-text">
              {opponentName}
            </p>
            <p className="text-[11px] text-tg-hint">
              {isOpponentViewer ? 'You' : 'Opponent'}
            </p>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-tg-text">
                <AnimatedCounter value={opponentScore} />
              </span>
              <span className="text-[11px] font-semibold text-tg-hint">pts</span>
            </div>

            <span className="mt-1 text-[11px] text-tg-hint">
              {opponentCorrect}/{opponentTotal} correct
            </span>

            {opponentDelta && (
              <div className="mt-1.5 flex items-center gap-1 text-xs">
                <span className={`font-bold ${opponentDelta.colorClass}`}>
                  {opponentDelta.text}
                </span>
                <span className="text-[10px] text-tg-hint">RR</span>
              </div>
            )}

            {opponentWon && (
              <span className="mt-2 flex items-center gap-1 rounded-full bg-tg-button/15 px-2.5 py-0.5 text-[10px] font-bold text-tg-button">
                <Crown className="h-2.5 w-2.5" />
                <span>Winner</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex w-full flex-col gap-2.5">
          <button
            type="button"
            onClick={handleShare1v1Results}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-tg-button font-bold text-tg-button-text shadow-sm transition-opacity hover:opacity-90 active:opacity-75"
          >
            <Share2 className="h-4 w-4" />
            <span>{copiedShare ? 'Opening Share...' : 'Share Victory'}</span>
          </button>

          <button
            type="button"
            onClick={onBattleAgain}
            disabled={isStartingBattleAgain}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-tg-secondary-bg font-bold text-tg-text shadow-sm transition-opacity hover:opacity-90 active:opacity-75 disabled:pointer-events-none disabled:opacity-50"
          >
            {isStartingBattleAgain ? (
              <Loader2 className="h-4 w-4 animate-spin text-tg-text shrink-0" />
            ) : (
              <Swords className="h-4 w-4 shrink-0" />
            )}
            <span>{isStartingBattleAgain ? 'Creating Battle...' : 'Battle Again'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToProfile}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-tg-secondary-bg text-sm font-semibold text-tg-hint transition-colors hover:text-tg-text active:opacity-75"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
