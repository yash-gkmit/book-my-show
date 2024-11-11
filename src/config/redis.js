const redis = require('redis');
const process = require('process');
require('dotenv').config();

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.connect();
redisClient.on('connect', () => console.log('Redis Connected Successfully'));

redisClient.on('error', err => console.error('Redis error:', err));

module.exports = redisClient;
