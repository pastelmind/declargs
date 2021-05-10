/**
 * @file Type tests for OptionConfig
 */

import { expectAssignable, expectNotAssignable } from "tsd";
import type { OptionConfig } from "../src/types.js";

// Full format
expectAssignable<OptionConfig>({
  alias: ["dog-name", "cat-name"],
  default: "spot",
  description: "Assigns a name to your pet",
  type: "string",
});

// Optional
// Description is necessary for generating a help message
expectAssignable<OptionConfig>({
  description: "Description of the option",
});

// Aliases must be strings
expectNotAssignable<OptionConfig>({
  alias: [1, 2, 3],
  description: "Description of the option",
});
expectNotAssignable<OptionConfig>({
  alias: [Symbol("foo"), Symbol("bar")],
  description: "Description of the option",
});
expectNotAssignable<OptionConfig>({
  alias: [["foo", "bar"]],
  description: "Description of the option",
});
expectNotAssignable<OptionConfig>({
  alias: [{ foo: "bar" }],
  description: "Description of the option",
});
expectAssignable<OptionConfig>({
  alias: [], // Empty arrays are OK (should they?)
  description: "Description of the option",
});

// If a type is not specified, the default value can be string, boolean, or
// number.
expectAssignable<OptionConfig>({
  description: "Description of the option",
  default: "foo",
});
expectAssignable<OptionConfig>({
  description: "Description of the option",
  default: true,
});
expectAssignable<OptionConfig>({
  description: "Description of the option",
  default: 123,
});
expectNotAssignable<OptionConfig>({
  description: "Description of the option",
  default: [],
});
expectNotAssignable<OptionConfig>({
  description: "Description of the option",
  default: { foo: 1 },
});

// If the type is 'string', the default value must be a string.
expectAssignable<OptionConfig>({
  description: "Description of the option",
  type: "string",
  default: "hello",
});
expectNotAssignable<OptionConfig>({
  description: "Description of the option",
  type: "string",
  default: true,
});
expectNotAssignable<OptionConfig>({
  description: "Description of the option",
  type: "string",
  default: 123,
});

// If the type is 'boolean', the default value must be a boolean.
expectAssignable<OptionConfig>({
  description: "Description of the option",
  type: "boolean",
  default: false,
});
expectNotAssignable<OptionConfig>({
  description: "Description of the option",
  type: "boolean",
  default: "world",
});
expectNotAssignable<OptionConfig>({
  description: "Description of the option",
  type: "boolean",
  default: 789,
});
