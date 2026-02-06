import { Redis } from "ioredis";
import { logger } from "../utils/logger.js";

export const createRedisClient = (): Redis | null => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        logger.warn("REDIS_URL not set. Running without Redis adapter.");
        return null;
    }

    const client = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });

    client.on("error", (err: Error) => {
        logger.error("Redis connection error:", err);
    })

    client.on("connect", () => {
        logger.log("Connected to Redis (Upstash)");
    })

    return client;
};
