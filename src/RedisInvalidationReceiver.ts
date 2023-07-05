import {RedisClientType} from "redis";
import {ICache} from "./ICache";
import {halt, isNullOrEmpty} from "./utils";
import {PubSubListener} from "@redis/client/dist/lib/client/pub-sub";

/**
 * Subscribes to invalidation messages on a Redis topic and invalidates its inner cache when a message is received.
 */
export class RedisInvalidationReceiver implements ICache {

  #inner: ICache;
  #redis: RedisClientType;

  /**
   * @param inner The cache to invalidate.
   * @param redis A redis objecit that allows subscribing to Redis pubsub messages.
   * @param channel The channel the ISubscriber gets invalidation messages from.
   */
  constructor(inner: ICache, redis: RedisClientType, channel: string) {
    if (!inner) throw new Error("Argument null (inner)");
    if (!redis) throw new Error("Argument null (redis)");
    if (isNullOrEmpty(channel)) throw new Error("Argument null (channel)");

    this.#inner = inner;
    this.#redis = redis;

    const pulse = (channel: string, message: string) => {
      this.#inner.invalidate(message);
    }

    this.#redis.subscribe(channel, pulse);
  }

  getSetAsync<T>(key: string, calculateValue: () => Promise<T>, duration: number): Promise<T | null> {
    return this.#inner.getSetAsync(key, calculateValue, duration);
  }
  
  getSet<T>(key: string, calculateValue: () => T, duration: number): T | null {
    return this.#inner.getSet(key, calculateValue, duration);
  }
  
  invalidate(key: string): void {
    this.#inner.invalidate(key);
  }

  async invalidateAsync(key: string): Promise<void> {
    await this.#inner.invalidateAsync(key);
  }
}