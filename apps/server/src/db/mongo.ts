import {
  MongoClient,
  type Db,
  type IndexSpecification,
  type CreateIndexesOptions,
} from 'mongodb';

let client: MongoClient | null = null;
let database: Db | null = null;
let memoryServerInstance: { stop: () => Promise<boolean> } | null = null;

export async function initDatabase(uri: string): Promise<Db> {
  if (database) {
    return database;
  }

  let connectionUri = uri;
  if (uri === 'memory') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    memoryServerInstance = mongod;
    connectionUri = mongod.getUri();
  }

  try {
    client = new MongoClient(connectionUri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 6000,
    });
    await client.connect();
    database = client.db();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production' && uri !== 'memory') {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      memoryServerInstance = mongod;
      client = new MongoClient(mongod.getUri());
      await client.connect();
      database = client.db();
    } else {
      throw err;
    }
  }

  await ensureIndexes(database);

  return database;
}

async function createCriticalIndex(
  db: Db,
  collectionName: string,
  spec: IndexSpecification,
  options?: CreateIndexesOptions,
): Promise<void> {
  try {
    await db.collection(collectionName).createIndex(spec, options);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(
      `Critical index failure on collection '${collectionName}' with spec ${JSON.stringify(spec)}: ${msg}\n`,
    );
    throw error;
  }
}

async function createOptionalIndex(
  db: Db,
  collectionName: string,
  spec: IndexSpecification,
  options?: CreateIndexesOptions,
): Promise<void> {
  try {
    await db.collection(collectionName).createIndex(spec, options);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(
      `Warning: Optional index creation failed on '${collectionName}': ${msg}\n`,
    );
  }
}

export async function ensureIndexes(db: Db): Promise<void> {
  await createCriticalIndex(db, 'profiles', { telegramUserId: 1 }, { unique: true });
  await createOptionalIndex(db, 'profiles', { bestScore: -1 });
  await createOptionalIndex(db, 'profiles', { currentSeason: 1, battleRating: -1 });

  await createCriticalIndex(db, 'runs', { runId: 1 }, { unique: true });
  await createOptionalIndex(db, 'runs', { telegramUserId: 1, createdAt: -1 });
  await createOptionalIndex(db, 'runs', {
    mode: 1,
    dailyDate: 1,
    'finalScore.totalScore': -1,
  });

  await createCriticalIndex(db, 'challenges', { challengeId: 1 }, { unique: true });
  await createOptionalIndex(db, 'challenges', { challengerUserId: 1 });
  await createOptionalIndex(db, 'challenges', { opponentUserId: 1 });

  try {
    const existingChallengeIndexes = await db.collection('challenges').indexes();
    const legacyExpiresAt = existingChallengeIndexes.find(
      (idx) => idx.name === 'expiresAt_1' && idx.expireAfterSeconds === undefined,
    );
    if (legacyExpiresAt) {
      await db.collection('challenges').dropIndex('expiresAt_1');
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Notice: Failed to drop legacy challenge index: ${msg}\n`);
  }

  await createOptionalIndex(
    db,
    'challenges',
    { expiresAt: 1 },
    {
      expireAfterSeconds: 0,
      partialFilterExpression: { status: { $in: ['pending', 'expired'] } },
    },
  );

  await createCriticalIndex(db, 'battles', { battleId: 1 }, { unique: true });
  await createOptionalIndex(db, 'battles', { challengerUserId: 1 });
  await createOptionalIndex(db, 'battles', { opponentUserId: 1 });
  await createOptionalIndex(db, 'battles', { chatId: 1, status: 1 });
  await createOptionalIndex(db, 'battles', { 'participants.userId': 1 });

  try {
    const existingBattleIndexes = await db.collection('battles').indexes();
    const legacyExpiresAt = existingBattleIndexes.find(
      (idx) => idx.name === 'expiresAt_1' && idx.expireAfterSeconds === undefined,
    );
    if (legacyExpiresAt) {
      await db.collection('battles').dropIndex('expiresAt_1');
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Notice: Failed to drop legacy battle index: ${msg}\n`);
  }

  await createOptionalIndex(
    db,
    'battles',
    { expiresAt: 1 },
    {
      expireAfterSeconds: 0,
      partialFilterExpression: { status: { $in: ['waiting', 'expired'] } },
    },
  );

  await createCriticalIndex(db, 'daily_challenge_definitions', { date: 1 }, { unique: true });
  await createCriticalIndex(
    db,
    'daily_challenge_attempts',
    { telegramUserId: 1, date: 1 },
    { unique: true },
  );

  await createCriticalIndex(db, 'flags', { isoCode: 1 }, { unique: true });
  await createOptionalIndex(db, 'flags', { tier: 1 });

  await createCriticalIndex(db, 'cosmetics', { id: 1 }, { unique: true });
  await createOptionalIndex(db, 'cosmetics', { category: 1 });

  await createCriticalIndex(db, 'subscriptions', { telegramUserId: 1 }, { unique: true });
  await createCriticalIndex(
    db,
    'season_results',
    { telegramUserId: 1, season: 1 },
    { unique: true },
  );
  await createCriticalIndex(db, 'processed_payments', { chargeId: 1 }, { unique: true });
  await createCriticalIndex(db, 'referrals', { newPlayerTelegramUserId: 1 }, { unique: true });
  await createOptionalIndex(db, 'referrals', { inviterTelegramUserId: 1, status: 1 });
}

export function getDatabase(): Db {
  if (!database) {
    throw new Error('Database is not initialized');
  }
  return database;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
}
