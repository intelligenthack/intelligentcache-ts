import {assert} from "chai";
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
    assert.isTrue(called);

  });

  it("when key is missed in getSetAsync, lambda is called", async () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    let called = false;

    // Act
    const result = await sut.getSetAsync("testKey", async () => {called = true; return "42";}, 10);

    // Assert
    assert.equal("42", result);
    assert.isTrue(called);
  });

  it("when key hit in getSet, lambda is not called", () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    sut.getSet("testKey", () => {return "42";}, 20);
    let called = false;

    // Act
    const result = sut.getSet("testKey", () => {called = true; return "not 42";}, 1);

    // Assert
    assert.equal("42", result);
    assert.isFalse(called);
  });

  it("when key hit in getSetAsync, lambda is not called", async () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    await sut.getSetAsync("testKey", async () => {return "42";}, 20);
    let called = false;

    // Act
    const result = await sut.getSetAsync("testKey", async () => {called = true; return "not 42";}, 1);

    // Assert
    assert.equal("42", result);
    assert.isFalse(called);
  });

  it("when key has expired in getSet, lambda is not called", () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    sut.getSet("testKey", () => {return "42";}, 0);
    let called = false;

    // Act
    const result = sut.getSet("testKey", () => {called = true; return "not 42";}, 1);

    // Assert
    assert.equal("not 42", result);
    assert.isTrue(called);
  });

  it("when key has expired in getSetAsync, lambda is not called", async () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    await sut.getSetAsync("testKey", async () => {return "42";}, 0);
    let called = false;

    // Act
    const result = await sut.getSetAsync("testKey", async () => {called = true; return "not 42";}, 1);

    // Assert
    assert.equal("not 42", result);
    assert.isTrue(called);
  });

  it("when key was invalidated in getSet, lambda is not called", () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    sut.getSet("testKey", () => {return "42";}, 60);
    sut.invalidate("testKey");
    let called = false;

    // Act
    const result = sut.getSet("testKey", () => {called = true; return "not 42";}, 1);

    // Assert
    assert.equal("not 42", result);
    assert.isTrue(called);
  });

  it("when key was invalidated in getSetAsync, lambda is not called", async () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    await sut.getSetAsync("testKey", async () => {return "42";}, 60);
    sut.invalidate("testKey");
    let called = false;

    // Act
    const result = await sut.getSetAsync("testKey", async () => {called = true; return "not 42";}, 1);

    // Assert
    assert.equal("not 42", result);
    assert.isTrue(called);
  });

  it("when key was invalidated asynchronously in getSetAsync, lambda is not called", async () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    await sut.getSetAsync("testKey", async () => {return "42";}, 60);
    await sut.invalidateAsync("testKey");
    let called = false;

    // Act
    const result = await sut.getSetAsync("testKey", async () => {called = true; return "not 42";}, 1);

    // Assert
    assert.equal("not 42", result);
    assert.isTrue(called);
  });

  it("getSet allows infinite duration", () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    sut.getSet("testKey", () => {return "42";}, Infinity);
    let called = false;

    // Act
    const result = sut.getSet("testKey", () => {called = true; return "not 42";}, 1);

    // Assert
    assert.equal("42", result);
    assert.isFalse(called);
  });

  it("getSet returns null when trying to save null values", () => {
    // Arrange
    const sut = new MemoryCache(generatePrefix());
    let called = false;

    // Act
    const result = sut.getSet("testKey", () => {called = true; return null;}, 1);

    // Assert
    assert.isNull(result);
    assert.isTrue(called);
  });
});