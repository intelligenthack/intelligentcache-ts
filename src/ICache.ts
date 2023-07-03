export interface ICache {
  /**
   * Gets the value associated to the specified key asynchronously.
   * If no value is currently associated, uses <paramref name="calculateValue"/> to retrieve it.
   * @param key The cache key.
   * @param calculateValue A callback that produces a new value if the key is not in cache.
   * @param duration Indicates how long the value should be kept in the cache. Use `Infinity` to prevent expiration.
   */
  getSetAsync<T>(key: string, calculateValue: () => Promise<T>, duration: number): Promise<T | null>;

  /**
  * Gets the value associated to the specified key.
  * If no value is currently associated, uses <paramref name="calculateValue"/> to retrieve it.
   * @param key The cache key.
   * @param calculateValue A callback that produces a new value if the key is not in cache.
   * @param duration Indicates how long the value should be kept in the cache. Use `Infinity` to prevent expiration.
   */
  getSet<T>(key: string, calculateValue: () => T, duration: number): T | null;

  /**
   * Invalidates the specified key.
   * @param key The cache key.
   */
  invalidate(key: string): void;

  /**
   * Invalidates the specified key.
   * @param key The cache key.
   */
  invalidateAsync(key: string): Promise<void>;
}