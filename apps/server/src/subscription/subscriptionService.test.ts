import { describe, it, beforeEach, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { hasActiveSubscription, processSuccessfulPayment } from './subscriptionService.js';
import { initDatabase, closeDatabase } from '../db/mongo.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { type Db } from 'mongodb';

describe('Subscription Service', () => {
  let mongod: MongoMemoryServer;
  let db: Db;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    db = await initDatabase(mongod.getUri());
  });

  after(async () => {
    await closeDatabase();
    if (mongod) {
      await mongod.stop();
    }
  });

  beforeEach(async () => {
    await db.collection('subscriptions').deleteMany({});
    await db.collection('processed_payments').deleteMany({});
  });

  it('returns false for hasActiveSubscription when no subscription exists', async () => {
    const active = await hasActiveSubscription(12345);
    assert.equal(active, false);
  });

  it('creates a new subscription on successful payment', async () => {
    const sub = await processSuccessfulPayment(12345, 'charge_123');

    assert.equal(sub.telegramUserId, 12345);
    assert.equal(sub.status, 'active');
    assert.equal(sub.telegramChargeId, 'charge_123');

    const expectedEnd = new Date();
    expectedEnd.setMonth(expectedEnd.getMonth() + 1);

    assert.ok(Math.abs(sub.currentPeriodEnd.getTime() - expectedEnd.getTime()) < 5000);

    const active = await hasActiveSubscription(12345);
    assert.equal(active, true);
  });

  it('extends an existing active subscription', async () => {
    const firstSub = await processSuccessfulPayment(12345, 'charge_123');
    const secondSub = await processSuccessfulPayment(12345, 'charge_456');

    const expectedEnd = new Date(firstSub.currentPeriodEnd);
    expectedEnd.setMonth(expectedEnd.getMonth() + 1);

    assert.equal(secondSub.currentPeriodEnd.getTime(), expectedEnd.getTime());
    assert.equal(secondSub.telegramChargeId, 'charge_456');
  });

  it('returns false for hasActiveSubscription when expired', async () => {
    await processSuccessfulPayment(12345, 'charge_123');

    await db
      .collection('subscriptions')
      .updateOne(
        { telegramUserId: 12345 },
        { $set: { currentPeriodEnd: new Date(Date.now() - 1000) } },
      );

    const active = await hasActiveSubscription(12345);
    assert.equal(active, false);
  });

  it('processes payment idempotently when identical chargeId is delivered multiple times', async () => {
    const firstSub = await processSuccessfulPayment(12345, 'charge_dup_1', db, {
      amount: 250,
      currency: 'XTR',
      payload: 'pro_sub_12345_1',
    });

    const secondSub = await processSuccessfulPayment(12345, 'charge_dup_1', db, {
      amount: 250,
      currency: 'XTR',
      payload: 'pro_sub_12345_1',
    });

    assert.equal(secondSub.currentPeriodEnd.getTime(), firstSub.currentPeriodEnd.getTime());
    assert.equal(secondSub.telegramChargeId, 'charge_dup_1');

    const paymentRecords = await db
      .collection('processed_payments')
      .find({ chargeId: 'charge_dup_1' })
      .toArray();
    assert.equal(paymentRecords.length, 1);
    assert.equal(paymentRecords[0].amount, 250);
    assert.equal(paymentRecords[0].currency, 'XTR');
  });

  it('handles concurrent delivery of the same payment chargeId idempotently', async () => {
    const [sub1, sub2] = await Promise.all([
      processSuccessfulPayment(777, 'charge_concurrent', db, {
        amount: 250,
        currency: 'XTR',
        payload: 'pro_sub_777_1',
      }),
      processSuccessfulPayment(777, 'charge_concurrent', db, {
        amount: 250,
        currency: 'XTR',
        payload: 'pro_sub_777_1',
      }),
    ]);

    assert.equal(sub1.currentPeriodEnd.getTime(), sub2.currentPeriodEnd.getTime());
    const count = await db
      .collection('processed_payments')
      .countDocuments({ chargeId: 'charge_concurrent' });
    assert.equal(count, 1);
  });
});
