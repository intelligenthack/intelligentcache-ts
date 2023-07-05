import {RedisClientType} from "redis";
import {ICache} from "./ICache";
import {halt, isNullOrEmpty} from "./utils";

/**
 * Publishes invalidation messages to a Redis topic when invalidated.
 */
export class RedisInvalidationSender implements ICache {
  #redis: RedisClientType;
  #channel: string;
  
  constructor (redis: RedisClientType, channel: string) {
    if (!redis) throw new Error("Argument null (redis)");
    if (isNullOrEmpty(channel)) throw new Error("Argument null (channel)");
    this.#redis = redis;
    this.#channel = channel;
  }
  async getSetAsync<T>(key: string, calculateValue: () => Promise<T>, duration: number): Promise<T | null> {
    return await calculateValue();
  }
  getSet<T>(key: string, calculateValue: () => T, duration: number): T | null {
    return calculateValue();
  }
  invalidate(key: string): void {
    halt(this.#redis.publish(this.#channel, key));
  }
  async invalidateAsync(key: string): Promise<void> {
    await this.#redis.publish(this.#channel, key);
  }
}