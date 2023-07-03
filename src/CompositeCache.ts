import {ICache} from "./ICache";

export class CompositeCache implements ICache {
  #_level1: ICache;
  #_level2: ICache;

  /**
  * Creates a two-level hierarchical cache.
  * Values are retrieved first from the first level.
  * If no value is found, the second level is used.
  * @param level1 This is the first cache to be checked. If there is a cache miss, the second level cache will be attempted
  * @param level2 Second level cache (usually a shared/remote cache in a webfarm). Called when the first level cache misses.
  */
  constructor(level1: ICache, level2: ICache) {
    if (!level1) throw new Error("Argument null (level1)");
    if (!level2) throw new Error("Argument null (level2)")
    this.#_level1 = level1!;
    this.#_level2 = level2!;
  }

  getSet<T>(key: string, calculateValue: () => T, duration: number): T | null {
    return this.#_level1.getSet(key, () => this.#_level2.getSet(key, calculateValue, duration), duration);
  }

  async getSetAsync<T>(key: string, calculateValue: () => Promise<T>, duration: number): Promise<T | null> {
    return this.#_level1.getSetAsync(key, () => this.#_level2.getSetAsync(key, calculateValue, duration), duration);
  }

  invalidate(key: string): void {
    this.#_level2.invalidate(key);
    this.#_level1.invalidate(key);
  }

  async invalidateAsync(key: string): Promise<void> {
    await this.#_level2.invalidateAsync(key);
    await this.#_level1.invalidateAsync(key);
  }
}