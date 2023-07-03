import {ICache} from "./ICache";

interface IDictionary<T> {[Key: string]: T;}
type MemoryCacheValue = {expiration: Date, value: any}
function isNullOrEmpty(s: string): boolean {
  return !!s && s.length > 0;
}

/**
 * An implementation of <see cref="ICache" /> that stores values in a hash/>.
 */
export class MemoryCache implements ICache {
  #prefix: string;
  #innerCache: IDictionary<any> = {};

  /**
   * Creates a cache that runs in the server memory.
   * @param prefix This string is prefixed to the key names to partition the keys if the underlying storage is shared
   * @param innerMemoryCache If not undefined, the cache will use the given <see cref="System.Runtime.Caching.MemoryCache"/> instead of the default one.
   */
  constructor(prefix: string, innerMemoryCache?: IDictionary<MemoryCacheValue>) {
    if (!!innerMemoryCache) this.#innerCache = innerMemoryCache!;
    if (isNullOrEmpty(prefix)) throw new Error("Agument Null (prefix)");
    this.#prefix = prefix + ":";
  }

  getSet<T>(key: string, calculateValue: () => T, duration: number): T | null {
    const k = this.#prefix + key;
    const res = this.#innerCache[k];
    if (!!res) {
      if (res.expiration > Date.now())
        return res.value as T;
      else
        delete this.#innerCache[k];
    };
    const value = calculateValue();
    if (value == undefined) return null; // Not all caches support null values. Also, caching a null is dodgy in itself.

    const expiration = duration == Infinity ? new Date(Infinity) : Date.now() + duration * 1000;
    this.#innerCache[k] = {expiration, value};
    return value;
  }

  invalidate(key: string) {
    const k = this.#prefix + key;
    delete this.#innerCache[k];
  }

  async getSetAsync<T>(key: string, calculateValue: () => Promise<T>, duration: number): Promise<T | null> {
    const k = this.#prefix + key;
    const res = this.#innerCache[k];
    if (!!res) {
      if (res.expiration > Date.now())
        return res.value as T;
      else
        delete this.#innerCache[k];
    };
    const value = await calculateValue();
    if (value == undefined) return null; // Not all caches support null values. Also, caching a null is dodgy in itself.

    const expiration = duration == Infinity ? new Date(Infinity) : Date.now() + duration * 1000;
    this.#innerCache[k] = {expiration, value};
    return value;
  }

  async invalidateAsync(key: string): Promise<void> {
    this.invalidate(key);
    return Promise.resolve();
  }
}