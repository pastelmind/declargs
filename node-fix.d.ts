// Make node:* prefixed Node.js modules available to TypeScript.
// These were temporarily provided by @types/node, but was quickly removed.
// See https://github.com/DefinitelyTyped/DefinitelyTyped/pull/52595

declare module "node:assert" {
  import assert = require("assert");
  export = assert;
}
