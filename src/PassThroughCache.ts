import {ICache} from "./ICache"
/**
 * An implementation of <see cref="ICache" /> that always calls the <paramref name="calculateValue"/> callback.
 * This class provides a "null object" implementation of <see cref="ICache" />.
 * It can be useful in tests or other contexts that require a cache.
 */
export class PassThroughCache implements ICache {
  public getSet<T>(key: string, calculateValue: () => T, duration: number): T | null {
    return calculateValue();
  }

  public async getSetAsync<T>(key: string, calculateValue: () => Promise<T>, duration: number): Promise<T | null> {
    return await calculateValue();
  }

  public invalidate(key: string): void {
    return;
  }

  public async invalidateAsync(key: string): Promise<void> {
    return Promise.resolve();
  }
}