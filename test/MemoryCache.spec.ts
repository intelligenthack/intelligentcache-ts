import { assert } from "chai";
import {MemoryCache} from "../src/MemoryCache";

describe("MemoryCache", () => {
  let _nextCachePrefixId = 0;
  const generatePrefix = () => {
    const prefixId = _nextCachePrefixId++;
    return `test${prefixId}`;
  }

  it("when key is missed in getSet, lambda is called", () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    let called = false;

    // Act
    const result = sut.getSet("testKey", () => {called = true; return "42";}, 10);

    // Assert
    assert.equal(result, "42");
    assert.ok(called);

  });
});