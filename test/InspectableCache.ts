import {ICache} from "../src/ICache";

export class InspectableCache implements ICache {
  
  #_onCall: (string) => void;
  #_cacheMiss: boolean;

  constructor(onCall: (string)=>void, cacheMiss: boolean = false)  {
    if (!onCall) throw new Error("Argument null (onCall)");
      this.#_onCall = onCall!;
      this.#_cacheMiss = cacheMiss;
  }

  async getSetAsync<T>(key: string, calculateValue: () => Promise<T>, duration: number): Promise<T | null> {
    this.#_onCall(key);
    if (this.#_cacheMiss) await calculateValue();
    return null;
  }
  
  getSet<T>(key: string, calculateValue: () => T, duration: number): T | null {
    this.#_onCall(key);
    if (this.#_cacheMiss) calculateValue();
    return null;
  }
  invalidate(key: string): void {
    this.#_onCall(key);
  }
  async invalidateAsync(key: string): Promise<void> {
    this.#_onCall(key);
    return Promise.resolve();
  }

}