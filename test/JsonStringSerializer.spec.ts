import {assert} from "chai";
import {JsonStringSerializer} from "../src/JsonStringSerializer"

describe("JsonStringSerializer", () => {
  it("performs round trip with an immediate object", () => {
    // Arrange
    const object = {theAnswer: 42, author: "Douglas Adams"};
    const sut = new JsonStringSerializer();

    // Act
    const res = sut.serialize(object);

    // Assert
    assert.typeOf(res, "string");
    assert.isNotEmpty(res);

    // Act
    const back = sut.deserialize(res);

    // Assert
    assert.deepEqual(back, object);
  });

  it("throws if a buffer is passed to deserialize", () => {
    // Arrange
    const sut = new JsonStringSerializer();
    const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);

    // Act-Assert
    assert.throws(() => {sut.deserialize(buf);});
  });

  it("throws if a non-json string is passed to deserialize", () => {
    // Arrange
    const sut = new JsonStringSerializer();
    const nonJson = "Douglas Adams";

    // Act-Assert
    assert.throws(() => {sut.deserialize(nonJson);});
  });

});