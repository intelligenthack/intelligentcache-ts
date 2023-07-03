import {assert} from "chai";
import {PassThroughCache} from "../src/PassThroughCache";

describe("PassThroughCache", ()=>{
  it("getSet lambda is always called", ()=>  {
      // Arrange
      const sut = new PassThroughCache();
      let count = 0;
  
      // Act
      let result = sut.getSet("testKey", () => { count++; return "41"; }, 10);
  
      result = sut.getSet("testKey", () => { count++; return "42"; }, 10);
  
      // Assert
      assert.equal("42", result);
      assert.equal(2, count);
  });
});
