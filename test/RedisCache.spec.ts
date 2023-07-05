import {assert} from "chai";
import {RedisCache} from "../src/RedisCache";
import {Mock, It} from "moq.ts";
import {RedisClientType} from "redis";

describe("RedisCache", () => {
  it("getSet calls calculateValue on miss", async () => {
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
});