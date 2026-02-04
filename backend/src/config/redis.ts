import { Redis } from "ioredis";


export const createRedisClient = (): Redis | null => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        console.warn("REDIS_URL not set. Running without Redis adapter.");
        return null;
    }

    const client = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });

    client.on("error", (err: Error) => {
        console.error("Redis connection error:", err);
    })

    client.on("connect", () => {
        console.log("Connected to Redis (Upstash)");
    })

    return client;
};