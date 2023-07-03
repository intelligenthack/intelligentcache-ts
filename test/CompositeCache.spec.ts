import {assert} from "chai";
import {CompositeCache} from "../src/CompositeCache"
import {InspectableCache} from "./InspectableCache";

describe("CompositeCache", () => {
  it("getSet when l1 hits then l2 not called", () => {
    // Arrange
    let l1 = false;
    let l2 = false;
    const level1 = new InspectableCache((key) => {l1 = true;});
    const level2 = new InspectableCache((key) => {l2 = true;});

    const sut = new CompositeCache(level1, level2);

    // Act
    const result = sut.getSet("a", () => "", 0);

    // Assert
    assert.isTrue(l1);
    assert.isFalse(l2);
  });


  it("getSet when l1 misses then l2 called", () => {
    // Arrange
    let l1 = false;
    let l2 = false;
    const level1 = new InspectableCache((key) => {l1 = true;}, true);
    const level2 = new InspectableCache((key) => {l2 = true;});

    const sut = new CompositeCache(level1, level2);

    // Act
    const result = sut.getSet("a", () => "", 0);

    // Assert
    assert.isTrue(l1);
    assert.isTrue(l2);
  });


  it("invalidateAsync when l2 called then l1 not called yet", async () => {
    // Arrange
    let l1 = false;
    let l2 = false;
    const level1 = new InspectableCache((key) => {l1 = true;});
    const level2 = new InspectableCache((key) => {l2 = true;});

    const sut = new CompositeCache(level1, level2);

    // Act
    await sut.invalidateAsync("a");

    // Assert
    assert.isTrue(l1);
    assert.isTrue(l2);
  });


  it("invalidateAsync when called l1 and l2 called", async () => {
    // Arrange
    let l1First = false;
    let l2First = false;
    const level1 = new InspectableCache((key) => {l1First = !l2First;});
    const level2 = new InspectableCache((key) => {l2First = !l1First;});

    const sut = new CompositeCache(level1, level2);

    // Act
    await sut.invalidateAsync("a");

    // Assert
    assert.isTrue(l2First);
    assert.isFalse(l1First);
  });
});