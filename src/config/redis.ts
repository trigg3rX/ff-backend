import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const redisClient = createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
  password: redisConfig.password,
});

redisClient.on('connect', () => {
  logger.info('Redis connection established');
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to Redis');
    throw error;
  }
};

export const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    logger.info('Redis disconnected successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to disconnect from Redis');
    throw error;
  }
};
