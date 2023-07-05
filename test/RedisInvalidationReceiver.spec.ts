import {assert} from "chai";
import {Mock, It} from "moq.ts";
import {RedisClientType} from "redis";
import {RedisInvalidationReceiver} from "../src/RedisInvalidationReceiver";
import {InspectableCache} from "./InspectableCache"

describe("RedisInvalidationReceiver", () => {
  it("invalidation messages call inner cache's invalidation", () => {
    // Arrange
    let invalidatedKey: string | undefined = undefined;
    let callback: any = undefined;

    const innerCache = new InspectableCache(key => { 
      invalidatedKey = key; 
    });
    const redis = new Mock<RedisClientType>()
      .setup(i=>i.publish(It.IsAny(),It.IsAny()))
      .callback(async ({args: [channel, message]})=>{
        callback(channel, message);
        return 1;
      })
      .setup(i=>i.subscribe(It.IsAny(),It.IsAny()))
      .callback(async ({args: [channel, lambda]})=>{
        callback = lambda;
      })
      .object();

    const sut = new RedisInvalidationReceiver(innerCache, redis, "invalidation");

    // Act
    redis.publish("invalidation", "some key")

    // Assert
    assert.equal(invalidatedKey, "some key");
  });
});
