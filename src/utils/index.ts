const process = require ("node:process");

export function isNullOrEmpty(s: string): boolean {
  return !s || s.length === 0;
}

export function halt<T>(promise: Promise<T>): T | undefined {
  if (!promise) throw new Error("Argument exception (promise)");
  let result: T | undefined = undefined;
  let done = false;
  promise.then(res=>{
    done = true;
    result = res;
  });
  while(!done) {
    process._tickCallback();
  }
  return result;
};