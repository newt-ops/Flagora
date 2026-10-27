import crypto from 'node:crypto';
import type { Db } from 'mongodb';
import type { Redis as RedisClient } from 'ioredis';
import type {
  BattleSession,
  BattleParticipant,
  BattleInfoResponse,
  GroupPodiumItem,
  GroupBattleFinishedPayload,
  BattleStartPayload,
  BattleStartFlag,
  PlayerProfile,
  Continent,
} from '@flagora/shared';
import { DEFAULT_RUN_TIER_MIX } from '@flagora/shared';
import { getCachedFlags, getCachedFlagsByContinent } from '../game/flagCache.js';
import {
  BattleNotFoundError,
  BattleExpiredError,
  BattleAlreadyJoinedError,
  BattleAlreadyStartedError,
  BattleHostRequiredError,
  InsufficientPlayersError,
  LobbyFullError,
} from './battleTypes.js';
import { selectRunFlags, generateChoices } from '../game/flagSelection.js';
import type { GameRun, RunFlagItem } from '../game/runTypes.js';
import type { TypedSocketServer } from '../multiplayer/socketTypes.js';
import {
  sendTelegramMessage,
  editTelegramMessage,
  deleteTelegramMessage,
  type InlineKeyboardButton,
} from '../telegram/telegramService.js';

export const GROUP_BATTLE_CONFIG = {
  minPlayers: 2,
  maxPlayersLimit: 20,
  defaultMaxPlayers: 5,
  lobbyTtlMs: 10 * 60 * 1000,
  battleDurationMs: 60 * 1000,
  rewardPins: {
    firstPlace: 150,
    secondPlace: 75,
    thirdPlace: 40,
    participant: 15,
  },
};

export interface CreateGroupLobbyParams {
  chatId?: number | null;
  messageId?: number | null;
  hostUserId: number;
  hostDisplayName: string;
  hostPhotoUrl?: string | null;
  maxPlayers?: number;
  continent?: Continent;
  flagCount?: number;
  durationSeconds?: number;
}

export async function createGroupLobby(
  params: CreateGroupLobbyParams,
  db: Db,
): Promise<BattleSession> {
  const {
    chatId,
    messageId,
    hostUserId,
    hostDisplayName,
    hostPhotoUrl,
    maxPlayers,
    continent,
    flagCount,
    durationSeconds,
  } = params;

  const clampedMax = Math.min(
    GROUP_BATTLE_CONFIG.maxPlayersLimit,
    Math.max(GROUP_BATTLE_CONFIG.minPlayers, maxPlayers || GROUP_BATTLE_CONFIG.defaultMaxPlayers),
  );
  const clampedDuration =
    durationSeconds && durationSeconds >= 15 && durationSeconds <= 300
      ? durationSeconds
      : GROUP_BATTLE_CONFIG.battleDurationMs / 1000;
  const clampedFlags = flagCount && flagCount >= 5 && flagCount <= 50 ? flagCount : 10;
  const validContinent: Continent =
    continent && ['world', 'africa', 'asia', 'europe', 'americas', 'oceania'].includes(continent)
      ? continent
      : 'world';

  const now = new Date();

  if (chatId) {
    const existing = await db.collection<BattleSession>('battles').findOne({
      chatId,
      status: 'waiting',
      expiresAt: { $gt: now },
    });

    if (existing) {
      if (messageId && existing.messageId !== messageId) {
        await db
          .collection<BattleSession>('battles')
          .updateOne({ battleId: existing.battleId }, { $set: { messageId } });
        existing.messageId = messageId;
      }
      return existing;
    }
  }

  const battleId = crypto.randomUUID();
  const expiresAt = new Date(now.getTime() + GROUP_BATTLE_CONFIG.lobbyTtlMs);

  const hostParticipant: BattleParticipant = {
    userId: hostUserId,
    telegramUserId: hostUserId,
    displayName: hostDisplayName,
    photoUrl: hostPhotoUrl ?? null,
    score: null,
    correctCount: 0,
    totalFlags: 0,
    ready: true,
  };

  const battleDoc: BattleSession = {
    battleId,
    chatId: chatId ?? null,
    messageId: messageId ?? null,
    isGroupBattle: true,
    maxPlayers: clampedMax,
    durationSeconds: clampedDuration,
    continent: validContinent,
    flagCount: clampedFlags,
    hostUserId,
    challengerUserId: hostUserId,
    opponentUserId: null,
    participants: [hostParticipant],
    status: 'waiting',
    createdAt: now,
    expiresAt,
    updatedAt: now,
  };

  await db.collection<BattleSession>('battles').insertOne(battleDoc);
  return battleDoc;
}

export interface JoinGroupLobbyParams {
  battleId: string;
  userId: number;
  telegramUserId: number;
  displayName: string;
  photoUrl?: string | null;
}

export async function joinGroupLobby(
  params: JoinGroupLobbyParams,
  db: Db,
  io?: TypedSocketServer,
): Promise<BattleSession> {
  const { battleId, userId, telegramUserId, displayName, photoUrl } = params;
  const now = new Date();

  const newParticipant: BattleParticipant = {
    userId,
    telegramUserId,
    displayName,
    photoUrl: photoUrl ?? null,
    score: null,
    correctCount: 0,
    totalFlags: 0,
    ready: true,
  };

  // Atomic race-safe join using MongoDB $expr condition
  const result = await db.collection<BattleSession>('battles').findOneAndUpdate(
    {
      battleId,
      status: 'waiting',
      expiresAt: { $gt: now },
      'participants.userId': { $ne: userId },
      $expr: { $lt: [{ $size: '$participants' }, '$maxPlayers'] },
    },
    {
      $push: { participants: newParticipant },
      $set: { updatedAt: now },
    },
    { returnDocument: 'after' },
  );

  if (result) {
    if (io) {
      io.to(`battle:${battleId}`).emit('groupParticipantsUpdated', {
        battleId,
        participants: result.participants ?? [],
      });
    }
    return result;
  }

  // Operation didn't match -> diagnose exact reason
  const battle = await db.collection<BattleSession>('battles').findOne({ battleId });
  if (!battle) {
    throw new BattleNotFoundError();
  }
  if (battle.status === 'expired' || new Date(battle.expiresAt).getTime() <= now.getTime()) {
    throw new BattleExpiredError();
  }
  if (battle.status !== 'waiting') {
    throw new BattleAlreadyStartedError();
  }
  if (battle.participants?.some((p) => p.userId === userId)) {
    throw new BattleAlreadyJoinedError('You have already joined this battle lobby');
  }
  if (
    (battle.participants?.length ?? 0) >=
    (battle.maxPlayers ?? GROUP_BATTLE_CONFIG.defaultMaxPlayers)
  ) {
    throw new LobbyFullError();
  }

  throw new BattleNotFoundError('Could not join battle lobby');
}

export async function leaveGroupLobby(
  battleId: string,
  userId: number,
  db: Db,
  io?: TypedSocketServer,
): Promise<BattleSession | null> {
  const battle = await db.collection<BattleSession>('battles').findOne({ battleId });
  if (!battle) {
    throw new BattleNotFoundError();
  }
  if (battle.status !== 'waiting') {
    throw new BattleAlreadyStartedError('Cannot leave a battle that is already in progress');
  }

  const now = new Date();
  const isHost = battle.hostUserId === userId;
  const participants = battle.participants ?? [];

  if (isHost) {
    const remaining = participants.filter((p) => p.userId !== userId);
    if (remaining.length === 0) {
      // Host was alone -> cancel lobby
      const updated = await db
        .collection<BattleSession>('battles')
        .findOneAndUpdate(
          { battleId, status: 'waiting' },
          { $set: { status: 'expired', updatedAt: now } },
          { returnDocument: 'after' },
        );
      if (io) {
        io.to(`battle:${battleId}`).emit('battleError', {
          message: 'Host left and battle lobby was closed',
          battleId,
        });
      }
      return updated;
    }

    // Transfer host to next participant
    const nextHost = remaining[0];
    const updated = await db.collection<BattleSession>('battles').findOneAndUpdate(
      { battleId, status: 'waiting' },
      {
        $pull: { participants: { userId } },
        $set: {
          hostUserId: nextHost.userId,
          challengerUserId: nextHost.userId,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' },
    );
    if (updated && io) {
      io.to(`battle:${battleId}`).emit('groupParticipantsUpdated', {
        battleId,
        participants: updated.participants ?? [],
      });
    }
    return updated;
  }

  // Non-host player leaving
  const updated = await db.collection<BattleSession>('battles').findOneAndUpdate(
    { battleId, status: 'waiting' },
    {
      $pull: { participants: { userId } },
      $set: { updatedAt: now },
    },
    { returnDocument: 'after' },
  );

  if (updated && io) {
    io.to(`battle:${battleId}`).emit('groupParticipantsUpdated', {
      battleId,
      participants: updated.participants ?? [],
    });
  }

  return updated;
}

export async function cancelGroupLobby(
  battleId: string,
  requestingUserId: number,
  db: Db,
  io?: TypedSocketServer,
): Promise<BattleSession> {
  const battle = await db.collection<BattleSession>('battles').findOne({ battleId });
  if (!battle) {
    throw new BattleNotFoundError();
  }
  if (battle.hostUserId !== requestingUserId) {
    throw new BattleHostRequiredError();
  }
  if (battle.status !== 'waiting') {
    throw new BattleAlreadyStartedError('Cannot cancel a battle that has already started');
  }

  const now = new Date();
  const updated = await db
    .collection<BattleSession>('battles')
    .findOneAndUpdate(
      { battleId, status: 'waiting', hostUserId: requestingUserId },
      { $set: { status: 'expired', updatedAt: now } },
      { returnDocument: 'after' },
    );

  if (!updated) {
    throw new BattleNotFoundError();
  }

  if (io) {
    io.to(`battle:${battleId}`).emit('battleError', {
      message: 'Battle lobby was canceled by the host',
      battleId,
    });
  }

  if (updated.chatId && updated.messageId) {
    void deleteTelegramMessage({
      chatId: updated.chatId,
      messageId: updated.messageId,
    });
  }

  return updated;
}

async function executeStartGroupBattle(
  battleId: string,
  requestingUserId: number,
  db: Db,
  redis?: RedisClient,
  io?: TypedSocketServer,
): Promise<BattleSession> {
  const now = new Date();

  // Atomic state transition to 'in_progress'
  const startedBattle = await db.collection<BattleSession>('battles').findOneAndUpdate(
    {
      battleId,
      status: 'waiting',
      hostUserId: requestingUserId,
      $expr: { $gte: [{ $size: '$participants' }, GROUP_BATTLE_CONFIG.minPlayers] },
    },
    {
      $set: {
        status: 'in_progress',
        startedAt: now,
        updatedAt: now,
      },
      $unset: {
        startingAt: '',
      },
    },
    { returnDocument: 'after' },
  );

  if (!startedBattle) {
    throw new BattleAlreadyStartedError('Battle could not be started or already started');
  }

  const countryPool = getCachedFlagsByContinent(startedBattle.continent);
  const targetCount = startedBattle.flagCount || 10;
  const flagsPool = countryPool.length >= targetCount ? countryPool : getCachedFlags();
  const selectedFlags = selectRunFlags(DEFAULT_RUN_TIER_MIX, [], flagsPool, targetCount);
  const runFlags: RunFlagItem[] = selectedFlags.map((country, index) => ({
    flagIndex: index,
    isoCode: country.isoCode,
    name: country.name,
    tier: country.tier,
    choices: generateChoices(country, flagsPool.length >= 4 ? flagsPool : getCachedFlags()),
    answered: false,
    correct: false,
  }));

  const battleStartFlags: BattleStartFlag[] = runFlags.map((f) => ({
    flagIndex: f.flagIndex,
    isoCode: f.isoCode,
    choices: f.choices,
  }));

  // 2. Create individual GameRuns for all participants sharing the exact flag seed
  const runsCollection = db.collection<GameRun>('runs');
  const updatedParticipants: BattleParticipant[] = [];
  const durationMs =
    (startedBattle.durationSeconds ?? GROUP_BATTLE_CONFIG.battleDurationMs / 1000) * 1000;

  for (const participant of startedBattle.participants ?? []) {
    const runId = crypto.randomUUID();
    const runDoc: GameRun = {
      runId,
      telegramUserId: participant.userId,
      mode: 'practice',
      status: 'active',
      startedAt: now,
      runDurationMs: durationMs,
      flags: runFlags.map((f) => ({ ...f })),
      runningTotal: 0,
      comboCount: 0,
      maxCombo: 0,
      profileCredited: false,
      createdAt: now,
      updatedAt: now,
    };

    await runsCollection.insertOne(runDoc);
    updatedParticipants.push({
      ...participant,
      runId,
    });
  }

  await db.collection<BattleSession>('battles').updateOne(
    { battleId },
    {
      $set: {
        flags: battleStartFlags,
        participants: updatedParticipants,
        updatedAt: new Date(),
      },
    },
  );

  if (io) {
    const payload: BattleStartPayload = {
      battleId,
      startedAt: now.toISOString(),
      runDurationMs: durationMs,
      flags: battleStartFlags,
      challengerRunId: updatedParticipants[0]?.runId ?? '',
      opponentRunId: updatedParticipants[1]?.runId ?? '',
    };
    io.to(`battle:${battleId}`).emit('battleStart', payload);
  }

  if (startedBattle.chatId && startedBattle.messageId) {
    const rawUsername =
      process.env.TELEGRAM_BOT_USERNAME || process.env.BOT_USERNAME || 'flagora_bot';
    const cleanUsername = rawUsername.replace(/^@/, '');
    const inProgressText =
      `⚔️ <b>FLAGORA BATTLE IN PROGRESS!</b> 🚩\n\n` +
      `👥 <b>Players:</b> ${updatedParticipants.length} racing\n` +
      `⏱️ <b>Time Limit:</b> 60 seconds\n\n` +
      `<i>Tap below to enter the live arena:</i>`;
    const miniAppUrl = `https://t.me/${cleanUsername}?startapp=battle_${battleId}`;
    void editTelegramMessage({
      chatId: startedBattle.chatId,
      messageId: startedBattle.messageId,
      text: inProgressText,
      parseMode: 'HTML',
      inlineKeyboard: [[{ text: '🎮 Enter Live Arena 🚩', url: miniAppUrl }]],
    });
  }

  const autoFinalizeTimer = setTimeout(async () => {
    try {
      await finalizeGroupBattle(battleId, db, redis, io, { force: true });
    } catch (err) {
      console.error('Failed to auto-finalize group battle after timer:', err);
    }
  }, durationMs + 1000);
  autoFinalizeTimer.unref?.();

  const finalDoc = await db.collection<BattleSession>('battles').findOne({ battleId });
  return finalDoc ?? startedBattle;
}

export async function startGroupBattle(
  battleId: string,
  requestingUserId: number,
  db: Db,
  redis?: RedisClient,
  io?: TypedSocketServer,
  options?: { countdownSeconds?: number },
): Promise<BattleSession> {
  const battle = await db.collection<BattleSession>('battles').findOne({ battleId });
  if (!battle) {
    throw new BattleNotFoundError();
  }
  if (battle.hostUserId !== requestingUserId) {
    throw new BattleHostRequiredError();
  }
  if (battle.status !== 'waiting') {
    throw new BattleAlreadyStartedError();
  }
  const participants = battle.participants ?? [];
  if (participants.length < GROUP_BATTLE_CONFIG.minPlayers) {
    throw new InsufficientPlayersError();
  }

  const countdownSeconds =
    options?.countdownSeconds !== undefined ? options.countdownSeconds : io ? 10 : 0;

  if (countdownSeconds <= 0 || !io) {
    return executeStartGroupBattle(battleId, requestingUserId, db, redis, io);
  }

  const now = new Date();
  const claimStarting = await db.collection<BattleSession>('battles').findOneAndUpdate(
    {
      battleId,
      status: 'waiting',
      hostUserId: requestingUserId,
      startingAt: { $exists: false },
    },
    {
      $set: {
        startingAt: new Date(now.getTime() + countdownSeconds * 1000),
        updatedAt: now,
      },
    },
    { returnDocument: 'after' },
  );

  if (!claimStarting) {
    throw new BattleAlreadyStartedError('Battle is already starting or started');
  }

  // Telegram Group Ping with clickable player mentions
  if (claimStarting.chatId) {
    const profilesCollection = db.collection<PlayerProfile>('profiles');
    const userIds = participants.map((p) => p.userId);
    const profiles = await profilesCollection.find({ telegramUserId: { $in: userIds } }).toArray();
    const profileMap = new Map(profiles.map((p) => [p.telegramUserId, p]));

    const mentions = participants
      .map((p) => {
        const prof = profileMap.get(p.userId);
        if (prof?.username) {
          return `@${prof.username.replace(/^@/, '')}`;
        }
        const safeName = (p.displayName || 'Player')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<a href="tg://user?id=${p.userId}">${safeName}</a>`;
      })
      .join(' ');

    const rawBotUsername =
      process.env.TELEGRAM_BOT_USERNAME || process.env.BOT_USERNAME || 'flagora_bot';
    const cleanUsername = rawBotUsername.replace(/^@/, '');
    const joinUrl = `https://t.me/${cleanUsername}?startapp=battle_${battleId}`;

    void sendTelegramMessage({
      chatId: claimStarting.chatId,
      text: `⚔️ <b>BATTLE STARTING IN ${countdownSeconds} SECONDS!</b> 🚩\n\n${mentions}\n\nGet ready and jump in now!`,
      parseMode: 'HTML',
      inlineKeyboard: [[{ text: '🎮 Enter Lobby in Flagora 🚩', url: joinUrl }]],
    });
  }

  // Socket countdown ticks
  const roomName = `battle:${battleId}`;
  io.to(roomName).emit('battleCountdown', { battleId, countdownSeconds });

  let remaining = countdownSeconds - 1;
  const intervalId = setInterval(() => {
    if (remaining > 0) {
      io.to(roomName).emit('battleCountdown', { battleId, countdownSeconds: remaining });
      remaining--;
    } else {
      clearInterval(intervalId);
    }
  }, 1000);
  intervalId.unref?.();

  setTimeout(async () => {
    clearInterval(intervalId);
    try {
      await executeStartGroupBattle(battleId, requestingUserId, db, redis, io);
    } catch (err) {
      console.error('Failed to start group battle after countdown:', err);
    }
  }, countdownSeconds * 1000);

  return claimStarting;
}

export async function finalizeGroupBattle(
  battleId: string,
  db: Db,
  redis?: RedisClient,
  io?: TypedSocketServer,
  options?: { force?: boolean },
): Promise<BattleSession | null> {
  const battle = await db.collection<BattleSession>('battles').findOne({ battleId });
  if (!battle || battle.status !== 'in_progress') {
    return battle;
  }

  const now = new Date();
  const startedAtMs = battle.startedAt ? new Date(battle.startedAt).getTime() : 0;
  const durationMs = (battle.durationSeconds ?? GROUP_BATTLE_CONFIG.battleDurationMs / 1000) * 1000;
  const isTimeExpired = startedAtMs > 0 && now.getTime() >= startedAtMs + durationMs;

  const participants = battle.participants ?? [];
  const runsCollection = db.collection<GameRun>('runs');
  let allParticipantsFinished = participants.length > 0;

  for (const p of participants) {
    if (!p.runId) {
      allParticipantsFinished = false;
      break;
    }
    const r = await runsCollection.findOne({ runId: p.runId });
    if (!r || (r.status !== 'finished' && r.status !== 'expired')) {
      allParticipantsFinished = false;
      break;
    }
  }

  if (!options?.force && !isTimeExpired && !allParticipantsFinished) {
    // Battle is actively ongoing; do not finalize prematurely
    return battle;
  }

  // Atomic idempotency guard: only ONE execution sets rewardsDistributed: true
  const claimResult = await db.collection<BattleSession>('battles').findOneAndUpdate(
    {
      battleId,
      status: 'in_progress',
      rewardsDistributed: { $ne: true },
    },
    {
      $set: {
        status: 'completed',
        rewardsDistributed: true,
        finalizedAt: now,
        completedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: 'after' },
  );

  if (!claimResult) {
    // Already claimed or finalized by another concurrent worker: return latest document
    let existing = await db.collection<BattleSession>('battles').findOne({ battleId });
    if (existing && !existing.podium) {
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        existing = await db.collection<BattleSession>('battles').findOne({ battleId });
        if (existing?.podium) {
          break;
        }
      }
    }
    return existing;
  }

  const profilesCollection = db.collection<PlayerProfile>('profiles');
  const finalParticipants = claimResult.participants ?? participants;

  // Collect results for each participant
  interface ParticipantScoreData {
    participant: BattleParticipant;
    score: number;
    correctCount: number;
    totalFlags: number;
    timeUsedMs: number;
  }

  const scoredList: ParticipantScoreData[] = [];

  for (const participant of finalParticipants) {
    let score = 0;
    let correctCount = 0;
    let totalFlags = 10;
    let timeUsedMs = GROUP_BATTLE_CONFIG.battleDurationMs;

    if (participant.runId) {
      const run = await runsCollection.findOne({ runId: participant.runId });
      if (run) {
        if (run.status === 'active') {
          await runsCollection.updateOne(
            { runId: participant.runId },
            { $set: { status: 'expired', finishedAt: now, updatedAt: now } },
          );
        }
        score = run.finalScore?.totalScore ?? run.runningTotal ?? 0;
        correctCount = run.flags.filter((f) => f.correct).length;
        totalFlags = run.flags.length;
        if (run.finishedAt) {
          timeUsedMs = Math.min(
            GROUP_BATTLE_CONFIG.battleDurationMs,
            new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime(),
          );
        }
      }
    }

    scoredList.push({
      participant,
      score,
      correctCount,
      totalFlags,
      timeUsedMs,
    });
  }

  // Sort descending by score, tie-break by timeUsedMs ascending
  scoredList.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.timeUsedMs - b.timeUsedMs;
  });

  const podium: GroupPodiumItem[] = [];
  const updatedParticipants: BattleParticipant[] = [];

  for (let i = 0; i < scoredList.length; i++) {
    const item = scoredList[i];
    const rank = i + 1;
    let pinsEarned = GROUP_BATTLE_CONFIG.rewardPins.participant;

    if (rank === 1) {
      pinsEarned = GROUP_BATTLE_CONFIG.rewardPins.firstPlace;
    } else if (rank === 2) {
      pinsEarned = GROUP_BATTLE_CONFIG.rewardPins.secondPlace;
    } else if (rank === 3) {
      pinsEarned = GROUP_BATTLE_CONFIG.rewardPins.thirdPlace;
    }

    // Atomically credit pins to player profile
    await profilesCollection.updateOne(
      { telegramUserId: item.participant.userId },
      { $inc: { pins: pinsEarned } },
    );

    const podiumItem: GroupPodiumItem = {
      userId: item.participant.userId,
      displayName: item.participant.displayName,
      photoUrl: item.participant.photoUrl,
      score: item.score,
      correctCount: item.correctCount,
      totalFlags: item.totalFlags,
      rank,
      pinsEarned,
    };

    podium.push(podiumItem);
    updatedParticipants.push({
      ...item.participant,
      score: item.score,
      correctCount: item.correctCount,
      totalFlags: item.totalFlags,
      rank,
      pinsEarned,
    });
  }

  // Save podium and finalized participants on the battle document
  const finalizedBattle = await db.collection<BattleSession>('battles').findOneAndUpdate(
    { battleId },
    {
      $set: {
        participants: updatedParticipants,
        podium,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' },
  );

  // Emit groupBattleFinished to Socket.IO
  if (io) {
    const payload: GroupBattleFinishedPayload = {
      battleId,
      completedAt: now.toISOString(),
      podium,
    };
    io.to(`battle:${battleId}`).emit('groupBattleFinished', payload);
  }

  if (claimResult.chatId) {
    let podiumText = `🏆 <b>FLAGORA BATTLE RESULTS</b> 🚩\n\n`;
    podium.slice(0, 5).forEach((p) => {
      const medal = p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`;
      podiumText += `${medal} <b>${p.displayName}</b> — ${p.score} pts (+${p.pinsEarned} 🪙)\n`;
    });
    podiumText += `\n<i>Tap below to start the next battle:</i>`;

    const rawUsername =
      process.env.TELEGRAM_BOT_USERNAME || process.env.BOT_USERNAME || 'flagora_bot';
    const cleanUsername = rawUsername.replace(/^@/, '');
    const keyboard: InlineKeyboardButton[][] = [
      [
        {
          text: '⚔️ New Battle 🚩',
          callback_data: 'gb_preset:5',
        },
        {
          text: '🎮 Open Mini App',
          url: `https://t.me/${cleanUsername}`,
        },
      ],
    ];

    let edited = false;
    if (claimResult.messageId) {
      edited = await editTelegramMessage({
        chatId: claimResult.chatId,
        messageId: claimResult.messageId,
        text: podiumText,
        parseMode: 'HTML',
        inlineKeyboard: keyboard,
      });
    }

    if (!edited) {
      void sendTelegramMessage({
        chatId: claimResult.chatId,
        text: podiumText,
        parseMode: 'HTML',
        inlineKeyboard: keyboard,
        disableNotification: true,
      });
    }
  }

  return finalizedBattle ?? claimResult;
}

export async function getGroupBattleInfo(
  battleId: string,
  requestingUserId: number,
  db: Db,
): Promise<BattleInfoResponse> {
  const battle = await db.collection<BattleSession>('battles').findOne({ battleId });
  if (!battle) {
    throw new BattleNotFoundError();
  }

  const isHost = battle.hostUserId === requestingUserId;
  const isParticipant = battle.participants?.some((p) => p.userId === requestingUserId) ?? false;
  const isJoinable =
    battle.status === 'waiting' &&
    new Date(battle.expiresAt).getTime() > Date.now() &&
    !isParticipant &&
    (battle.participants?.length ?? 0) <
      (battle.maxPlayers ?? GROUP_BATTLE_CONFIG.defaultMaxPlayers);

  const myParticipant = battle.participants?.find((p) => p.userId === requestingUserId);
  const durationMs = (battle.durationSeconds ?? GROUP_BATTLE_CONFIG.battleDurationMs / 1000) * 1000;
  const remainingSeconds =
    battle.status === 'in_progress' && battle.startedAt
      ? Math.max(
          0,
          Math.ceil((durationMs - (Date.now() - new Date(battle.startedAt).getTime())) / 1000),
        )
      : durationMs / 1000;

  return {
    battleId: battle.battleId,
    challengerUserId: battle.challengerUserId,
    challengerTelegramUserId: battle.challengerTelegramUserId,
    challengerDisplayName: battle.participants?.[0]?.displayName ?? 'Host',
    challengerPhotoUrl: battle.participants?.[0]?.photoUrl ?? null,
    status: battle.status,
    isChallenger: isHost,
    isOwnInvite: isHost,
    isOpponent: !isHost && isParticipant,
    isJoinable,
    expiresAt: battle.expiresAt,
    isGroupBattle: Boolean(battle.isGroupBattle),
    chatId: battle.chatId,
    maxPlayers: battle.maxPlayers,
    hostUserId: battle.hostUserId,
    isHost,
    participants: battle.participants,
    podium: battle.podium,
    completedAt: battle.completedAt,
    totalFlags: battle.flagCount ?? 10,
    durationSeconds: battle.durationSeconds ?? GROUP_BATTLE_CONFIG.battleDurationMs / 1000,
    continent: battle.continent ?? 'world',
    startedAt: battle.startedAt ?? null,
    flags: battle.flags ?? [],
    myRunId: myParticipant?.runId ?? null,
    remainingSeconds,
  };
}
