import {assert} from "chai";
import {Mock, It} from "moq.ts";
import {RedisClientType} from "redis";
import {RedisInvalidationSender} from "../src/RedisInvalidationSender";

describe("RedisInvalidationSender", () => {
  it("getSet always calls calculateValue", () => {
    // Arrange
    let calledTimes = 0;

    const redis = new Mock<RedisClientType>();

    const sut = new RedisInvalidationSender(redis.object(), "prefix");

    // Act
    const valueFromCache = sut.getSet("testKey", () => {calledTimes++; return "42";}, 10);
    const valueFromCache2 = sut.getSet("testKey", () => {calledTimes++; return "43";}, 10);

    // Assert
    assert.equal(calledTimes, 2);
    assert.equal("42", valueFromCache);
    assert.equal("43", valueFromCache2);
  });

  it("getSetAsync always calls calculateValue", async () => {
    // Arrange
    let calledTimes = 0;

    const redis = new Mock<RedisClientType>();

    const sut = new RedisInvalidationSender(redis.object(), "prefix");

    // Act
    const valueFromCache = await sut.getSetAsync("testKey", async () => {calledTimes++; return "42";}, 10);
    const valueFromCache2 = await sut.getSetAsync("testKey", async () => {calledTimes++; return "43";}, 10);

    // Assert
    assert.equal(calledTimes, 2);
    assert.equal("42", valueFromCache);
    assert.equal("43", valueFromCache2);
  });

  it("invalidate publishes an invalidation message", async () => {
    // Arrange
    let publishChannel: string | undefined = undefined;
    let publishMessage: string | undefined = undefined;

    const redis = new Mock<RedisClientType>()
    .setup(instance => instance.publish(It.IsAny(),It.IsAny()))
    .callback(async ({args: [channel, message]}) => {
      publishChannel = channel;
      publishMessage = message;
      return 1;
    });

    const sut = new RedisInvalidationSender(redis.object(), "channel");

    // Act
    sut.invalidate("testKey");

    // Assert
    assert.equal("channel", publishChannel);
    assert.equal("testKey", publishMessage);
  });

  it("invalidateAsync publishes an invalidation message", async () => {
    // Arrange
    let publishChannel: string | undefined = undefined;
    let publishMessage: string | undefined = undefined;

    const redis = new Mock<RedisClientType>()
    .setup(instance => instance.publish(It.IsAny(),It.IsAny()))
    .callback(async ({args: [channel, message]}) => {
      publishChannel = channel;
      publishMessage = message;
      return 1;
    });

    const sut = new RedisInvalidationSender(redis.object(), "channel");

    // Act
    await sut.invalidateAsync("testKey");

    // Assert
    assert.equal("channel", publishChannel);
    assert.equal("testKey", publishMessage);
  });
});
