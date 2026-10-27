import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { initRedis, closeRedis } from './redis.js';

describe('Redis Initialization and Fail-Fast Enforcement', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAllowMemory = process.env.ALLOW_MEMORY_REDIS;

  afterEach(async () => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ALLOW_MEMORY_REDIS = originalAllowMemory;
    await closeRedis();
  });

  it('initializes in-memory mock when url is explicitly memory', async () => {
    const redis = await initRedis('memory');
    assert.ok(redis);
    await redis.set('test_key', 'hello');
    const val = await redis.get('test_key');
    assert.equal(val, 'hello');
  });

  it('fails startup in production mode when Redis connection fails', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_MEMORY_REDIS;

    const invalidRedisUrl = 'redis://127.0.0.1:59999';

    await assert.rejects(
      async () => {
        await initRedis(invalidRedisUrl);
      },
      {
        message: /Critical Redis connection failure in production/,
      },
    );
  });

  it('falls back to in-memory store in development mode when connection fails', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.ALLOW_MEMORY_REDIS;

    const invalidRedisUrl = 'redis://127.0.0.1:59999';
    const redis = await initRedis(invalidRedisUrl);
    assert.ok(redis);
    await redis.set('dev_key', 'fallback_success');
    const val = await redis.get('dev_key');
    assert.equal(val, 'fallback_success');
  });

  it('allows fallback in production if ALLOW_MEMORY_REDIS is explicitly true', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_MEMORY_REDIS = 'true';

    const invalidRedisUrl = 'redis://127.0.0.1:59999';
    const redis = await initRedis(invalidRedisUrl);
    assert.ok(redis);
    await redis.set('prod_opt_in', 'ok');
    const val = await redis.get('prod_opt_in');
    assert.equal(val, 'ok');
  });
});
