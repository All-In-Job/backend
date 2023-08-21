import redis from 'redis';

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    legacyMode: true,
});

redisClient.on('connect', () => console.info('Redis 연결성공'));
redisClient.on('error', (err) =>
    console.error('Redis Client Error!!!', err.message),
);

export default redisClient;
