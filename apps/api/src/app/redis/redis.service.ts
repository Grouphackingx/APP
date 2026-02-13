import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6380');
    }

    onModuleDestroy() {
        this.client?.disconnect();
    }

    /**
     * Lock a seat for a user.
     * Pattern: SET lock:seat:{seatId} {userId} NX EX {ttlSeconds}
     * Returns true if lock was acquired, false if seat is already locked.
     */
    async lockSeat(seatId: string, userId: string, ttlSeconds = 600): Promise<boolean> {
        const key = `lock:seat:${seatId}`;
        const result = await this.client.set(key, userId, 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }

    /**
     * Unlock a seat (release the lock).
     * Only the user who locked it can unlock it.
     */
    async unlockSeat(seatId: string, userId: string): Promise<boolean> {
        const key = `lock:seat:${seatId}`;
        const currentHolder = await this.client.get(key);
        if (currentHolder === userId) {
            await this.client.del(key);
            return true;
        }
        return false;
    }

    /**
     * Check who holds the lock on a seat.
     */
    async getSeatLockHolder(seatId: string): Promise<string | null> {
        const key = `lock:seat:${seatId}`;
        return this.client.get(key);
    }

    /**
     * Unlock multiple seats for a user (batch).
     */
    async unlockSeats(seatIds: string[], userId: string): Promise<void> {
        for (const seatId of seatIds) {
            await this.unlockSeat(seatId, userId);
        }
    }

    /**
     * Generic get/set for future use.
     */
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }
}
