import {IRedisSerializer, RedisValue} from "./IRedisSerializer";

export class JsonStringSerializer implements IRedisSerializer {
  serialize<T>(instance: T): RedisValue {
    return JSON.stringify(instance, null, 0);
  }
  deserialize<T>(value: RedisValue): T {
    if (typeof value !== "string") throw new Error("Argument error (value)");
    return JSON.parse(value) as T;
  }
}