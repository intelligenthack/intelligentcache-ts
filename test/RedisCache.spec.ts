import {assert} from "chai";
import {RedisCache} from "../src/RedisCache";
import {Mock, It} from "moq.ts";
import {RedisClientType} from "redis";

describe("RedisCache", () => {
  it("getSet calls calculateValue on miss", () => {
    // Arrange
    let setKey: string | undefined;
    let setValue: string | undefined;
    let setOpts: {EX: number;} | undefined;
    let called = false;

    const redis = new Mock<RedisClientType>()
      .setup(instance => instance.set(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(({args: [key, value, opts]}) => {
        setKey = key;
        setValue = value;
        setOpts = opts;
        return Promise.resolve(value);
      })
      .setup(instance => instance.get(It.IsAny()))
      .callback(() => Promise.resolve(null));

    const sut = new RedisCache(redis.object(), "prefix");

    // Act
    const valueFromCache = sut.getSet("testKey", () => {called = true; return "42";}, 10);

    // Assert
    assert.isTrue(called);
    assert.equal(setKey, "prefix:testKey");
    assert.equal(setValue, '"42"');
    assert.equal(setOpts?.EX, 10);
    assert.equal("42", valueFromCache);
  });

  it("getSetAsync calls calculateValue on miss", async () => {
    // Arrange
    let setKey: string | undefined;
    let setValue: string | undefined;
    let setOpts: {EX: number;} | undefined;
    let called = false;

    const redis = new Mock<RedisClientType>()
      .setup(instance => instance.set(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(({args: [key, value, opts]}) => {
        setKey = key;
        setValue = value;
        setOpts = opts;
        return Promise.resolve(value);
      })
      .setup(instance => instance.get(It.IsAny()))
      .callback(() => Promise.resolve(null));

    const sut = new RedisCache(redis.object(), "prefix");

    // Act
    const valueFromCache = await sut.getSetAsync("testKey", async () => {called = true; return "42";}, 10);

    // Assert
    assert.isTrue(called);
    assert.equal(setKey, "prefix:testKey");
    assert.equal(setValue, '"42"');
    assert.equal(setOpts?.EX, 10);
    assert.equal("42", valueFromCache);
  });

  it("getSet uses cached value on hit", () => {
    // Arrange
    let called = false;
    let lookupKey: string | undefined = undefined;
    const redis = new Mock<RedisClientType>()
      .setup(instance => instance.set(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(({args: [key, value, opts]}) => Promise.resolve(value))
      .setup(instance => instance.get(It.IsAny()))
      .callback(({args: [key]}) => {
        lookupKey = key;
        return Promise.resolve('"42"');
      });

    const sut = new RedisCache(redis.object(), "prefix");
    // Act

    var valueFromCache = sut.getSet("testKey", () => {called = true; return "not 42";}, 10);

    // Assert
    assert.isFalse(called);
    assert.equal("42", valueFromCache);
    assert.equal("prefix:testKey", lookupKey);
  });

  it("getSetAsync uses cached value on hit", async () => {
    // Arrange
    let called = false;
    let lookupKey: string | undefined = undefined;
    const redis = new Mock<RedisClientType>()
      .setup(instance => instance.set(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(({args: [key, value, opts]}) => Promise.resolve(value))
      .setup(instance => instance.get(It.IsAny()))
      .callback(({args: [key]}) => {
        lookupKey = key;
        return Promise.resolve('"42"');
      });

    const sut = new RedisCache(redis.object(), "prefix");
    // Act

    var valueFromCache = await sut.getSetAsync("testKey", async () => {called = true; return "not 42";}, 10);

    // Assert
    assert.isFalse(called);
    assert.equal("42", valueFromCache);
    assert.equal("prefix:testKey", lookupKey);
  });

  it("invalidate clears the value", () => {
    // Arrange
    let setKey: string | undefined;

    const redis = new Mock<RedisClientType>()
      .setup(instance => instance.del(It.IsAny()))
      .callback(async ({args: [key]}) => {
        setKey=key;
        return 0;
      });

    const sut = new RedisCache(redis.object(), "prefix");

    // Act
    sut.invalidate("testKey");

    // Assert
    assert.equal(setKey, "prefix:testKey");
  });

  it("invalidateAsync clears the value", async () => {
    // Arrange
    let setKey: string | undefined;

    const redis = new Mock<RedisClientType>()
      .setup(instance => instance.del(It.IsAny()))
      .callback(async ({args: [key]}) => {
        setKey=key;
        return 0;
      });

    const sut = new RedisCache(redis.object(), "prefix");

    // Act
    await sut.invalidateAsync("testKey");

    // Assert
    assert.equal(setKey, "prefix:testKey");
  });

});