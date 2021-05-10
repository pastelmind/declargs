/**
 * @file Type tests for ParsedArgv and the generic subtypes used to build them
 */

import { expectType } from "tsd";
import type {
  DefiniteOptions,
  IndefiniteOptions,
  OptionAlias,
  OptionConfig,
  OptionConfigs,
  OptionValueType,
  ParsedArgv,
  ParsedArgvAliasUnion,
  ParsedArgvFragment,
} from "../src/types.js";

// ----------------- OptionConfig tests: Extracting information ------------- //

// If there is no 'type' field...
expectType<OptionValueType<{ description: string }>>(
  0 as boolean | number | string
);

// If there is a 'type' field...
expectType<OptionValueType<{ description: string; type: "boolean" }>>(
  true as boolean
);
expectType<OptionValueType<{ description: string; type: "string" }>>(
  "" as string
);

// Helper function (only the signature is needed)
declare function toOptionAlias<
  AliasType extends string,
  OptionCfg extends OptionConfig<AliasType>
>(cfg: OptionCfg): OptionAlias<OptionCfg>;

// No alias
expectType<never>(toOptionAlias({ description: "desc" }));
// With alias
expectType<"foo">(toOptionAlias({ description: "desc", alias: ["foo"] }));
expectType<"foo" | "bar">(
  toOptionAlias({ description: "desc", alias: ["foo", "bar"] })
);

// Helper function (only the signature is needed)
declare function toParsedArgvAliasUnion<
  AliasType extends string,
  OptionCfg extends OptionConfig<AliasType>
>(cfg: OptionCfg): ParsedArgvAliasUnion<OptionCfg>;

// Single OptionConfig, empty (no alias)
// eslint-disable-next-line @typescript-eslint/ban-types
expectType<{}>(toParsedArgvAliasUnion({ description: "desc" }));

// Single OptionConfig with aliases
expectType<{ foo: boolean | number | string | (boolean | number | string)[] }>(
  toParsedArgvAliasUnion({ description: "desc", alias: ["foo"] })
);
expectType<{ bar: boolean | boolean[]; baz: boolean | boolean[] }>(
  toParsedArgvAliasUnion({
    description: "desc",
    alias: ["bar", "baz"],
    type: "boolean",
  })
);

type X =
  | { foo: boolean | boolean[]; bar: boolean | boolean[] }
  | { baz: string | string[] };

// Union of multiple OptionConfig types
expectType<X>(
  toParsedArgvAliasUnion(
    {} as
      | {
          description: string;
          alias: ["foo", "bar"];
          type: "boolean";
        }
      | {
          description: string;
          alias: ["baz"];
          type: "string";
        }
  )
);

// ----------------- OptionConfigs tests: Filtering by "definite-ness" ------ //

// Has default
expectType<
  IndefiniteOptions<{
    foo: { description: string };
    bar: { description: string; default: number };
    baz: { description: string };
    qux: { description: string; default: string };
  }>
>("foo" as "foo" | "baz");
expectType<
  DefiniteOptions<{
    foo: { description: string };
    bar: { description: string; default: number };
    baz: { description: string };
    qux: { description: string; default: string };
  }>
>("bar" as "bar" | "qux");

// Is boolean
expectType<
  DefiniteOptions<{
    foo: { description: string; type: "boolean" };
    bar: { description: string; type: "string" };
    baz: { description: string };
    qux: { description: string; type: "boolean" };
  }>
>("foo" as "foo" | "qux");
expectType<
  IndefiniteOptions<{
    foo: { description: string; type: "boolean" };
    bar: { description: string; type: "string" };
    baz: { description: string };
    qux: { description: string; type: "boolean" };
  }>
>("bar" as "bar" | "baz");

// ----------------- ParsedArgv tests: Building a fragment ------------------ //

// Helper function (only the signature is needed)
declare function toParsedArgvFragment<
  AliasType extends string,
  Options extends OptionConfigs<AliasType>
>(opts: Options): ParsedArgvFragment<Options>;

// eslint-disable-next-line @typescript-eslint/ban-types
expectType<{}>(toParsedArgvFragment({}));

expectType<{
  foo: string | string[];
  bar: string | string[];
  dog: boolean | boolean[];
  cat: boolean | boolean[];
}>(
  toParsedArgvFragment({
    foo: {
      description: "desc",
      alias: ["bar"],
      type: "string",
    },
    dog: {
      description: "desc",
      alias: ["cat"],
      type: "boolean",
    },
  })
);

expectType<{
  fruit: boolean | boolean[];
  apple: boolean | boolean[];
  pear: boolean | boolean[];
  foo: boolean | number | string | (boolean | number | string)[];
  bar: boolean | number | string | (boolean | number | string)[];
  baz: boolean | number | string | (boolean | number | string)[];
}>(
  toParsedArgvFragment({
    fruit: { description: "desc", alias: ["apple", "pear"], type: "boolean" },
    foo: { description: "desc", alias: ["bar"] },
    baz: { description: "desc" },
  })
);

// ----------------- ParsedArgv tests: Putting everything together ---------- //

// Helper function (only the signature is needed)
declare function toParsedArgv<
  AliasType extends string,
  Options extends OptionConfigs<AliasType>
>(o: Options): ParsedArgv<Options>;

// An empty OptionConfigs object would result in no options being parsed
expectType<{ _: string[] }>(toParsedArgv({}));

// Options without defaults are indefinite; they may or may not be available in
// `ParsedArgv`.
// no defaults, no type
expectType<{
  "foo-flag"?: boolean | number | string | (boolean | number | string)[];
  _: string[];
}>(toParsedArgv({ "foo-flag": { description: "desc" } }));

// no defaults, with type
expectType<{ alpha?: string | string[]; _: string[] }>(
  toParsedArgv({ alpha: { description: "desc", type: "string" } })
);

// Options with defaults are definite; they are always available in `ParsedArgv`.
// defaults, no type
expectType<{
  "bar-flag": boolean | number | string | (boolean | number | string)[];
  _: string[];
}>(toParsedArgv({ "bar-flag": { description: "desc", default: "beer" } }));

// defaults, with type
expectType<{ alpha: string | string[]; _: string[] }>(
  toParsedArgv({
    alpha: { description: "desc", type: "string", default: "woot" },
  })
);

// Aliases, some with defaults, some without
expectType<{
  one?: string | string[];
  two?: string | string[];
  three?: string | string[];
  pet: boolean | boolean[];
  dog: boolean | boolean[];
  cat: boolean | boolean[];
  _: string[];
}>(
  toParsedArgv({
    one: {
      description: "desc",
      type: "string",
      alias: ["two", "three"],
    },
    pet: {
      description: "desc",
      type: "boolean",
      default: false,
      alias: ["dog", "cat"],
    },
  })
);
