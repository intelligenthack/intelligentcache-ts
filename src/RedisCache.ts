import {RedisClientType} from "redis";
import {ICache} from "./ICache";
import {halt, isNullOrEmpty} from "./utils";
import {IRedisSerializer} from "./IRedisSerializer";
import {JsonStringSerializer} from "./JsonStringSerializer";

/**
 * An implementation of <see cref="ICache" /> that stores values on Redis.
 */
export class RedisCache implements ICache {
  #redis: RedisClientType;
  #prefix: string;
  serializer: IRedisSerializer = new JsonStringSerializer();

  /**
   * Creates a cache that is stored on a Redis instance.
   * @param redis You should pass an open Redis connection
   * @param prefix This string is prefixed to the key names to partition the keys if the underlying storage is shared
   */
  constructor(redis: RedisClientType, prefix: string) {
    if (!redis) throw new Error("Argument null (redis)");
    if (isNullOrEmpty(prefix)) throw new Error("Argument null (prefix)");
    this.#redis = redis!;
    this.#prefix = prefix + ":";
  }


  async getSetAsync<T>(key: string, calculateValue: () => Promise<T>, duration: number): Promise<T | null> {
    const db = this.#redis;
    const k = this.#prefix + key;
    const res = await db.get(k);
    if (!!res) return this.serializer.deserialize<T>(res);
    const value = await calculateValue();
    if (value == null) return null; // Not all caches support null values. Also, caching a null is dodgy in itself.
    await db.set(k, this.serializer.serialize(value), {EX: duration});
    return value;
  }

  getSet<T>(key: string, calculateValue: () => T, duration: number): T | null {
    const db = this.#redis;
    const k = this.#prefix + key;
    const res = halt(db.get(k));
    if (!!res) return this.serializer.deserialize<T>(res);
    const value = calculateValue();
    if (value == null) return null; // Not all caches support null values. Also, caching a null is dodgy in itself.
    halt(db.set(k, this.serializer.serialize(value), {EX: duration}));
    return value;
  }
  invalidate(key: string): void {
    const k = this.#prefix + key;
    halt(this.#redis.del(k));
  }

  async invalidateAsync(key: string): Promise<void> {
    const k = this.#prefix + key;
    await this.#redis.del(k);
  }

}
