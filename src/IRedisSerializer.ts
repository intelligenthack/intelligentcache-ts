export type RedisValue = string | Buffer;
/**
 * Converts objects from / to a format that can be stored on Redis.
 */
export interface IRedisSerializer {
  /**
   * Converts the specified parameter to a <see cref="RedisValue"/>.
   * @param instance the object to be converted
   */
  serialize<T>(instance: T): RedisValue;

  /**
    * Converts the specified value to an object of type <typeparamref name="T"/>.
    * @param value the value serialized to a RedisValue
   */
  deserialize<T>(value: RedisValue): T;
}