require('dotenv').config();
const { Redis } = require('@upstash/redis');
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

async function test() {
  await redis.setex('test_key', 60, JSON.stringify({a: 1}));
  const res = await redis.get('test_key');
  console.log('GET setex:', res, typeof res);

  await redis.set('test_key2', JSON.stringify({b: 2}), { ex: 60 });
  const res2 = await redis.get('test_key2');
  console.log('GET set:', res2, typeof res2);
}
test();
