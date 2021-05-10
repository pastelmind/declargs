// --------------------------- Utility types -------------------------------- //

/**
 * Utility type.
 * A type that can be either a subtype or an array of subtypes.
 */
type MaybeArray<T> = T | T[];

/**
 * Utility type.
 * Combines an intersecetion type `A & B & ...` into a single type.
 * This isn't strictly needed, but it makes the resulting type look pretty.
 * (It also helps with type tests that check if two types are _strictly_
 * identical to each other.)
 */
type NormalizeIntersection<T> = { [Key in keyof T]: T[Key] };

/**
 * Utility type.
 * Converts a union to an intersection.
 */
// Source: (2018-05-16) https://stackoverflow.com/a/50375286/
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Utility type.
 * Returns all value types of an object.
 */
type ValueOf<T> = T[keyof T];

// ----------------- OptionConfig and associated types ---------------------- //

interface OptionConfigBase<
  AliasType extends string,
  TypeHint extends string | undefined,
  DefaultType extends boolean | string | number
> {
  /**
   * Aliases for the option.
   */
  // This must use a generic type to allow TypeScript to correctly infer the
  // types of string literals, which is used to construct the `ParsedArgv` type.
  alias?: AliasType[];
  /**
   * Default value for the option.
   * If `type` is given, this value must match the type.
   */
  default?: DefaultType;
  /**
   * Description for the option.
   * This is used to build the help message.
   */
  description: string;
  /**
   * Controls the type of the option value.
   * If omitted, the parser will attempt to coerce the value to a boolean,
   * number, or string by looking at it.
   */
  type?: TypeHint;
}

/**
 * User-supplied configuration for a single command-line option.
 */
export type OptionConfig<AliasType extends string = string> =
  | OptionConfigBase<AliasType, "boolean", boolean>
  | OptionConfigBase<AliasType, "string", string>
  | OptionConfigBase<AliasType, undefined, boolean | number | string>;

/**
 * User-supplied configuration for a single command-line option.
 */
export interface OptionConfigs<Aliases extends string = string> {
  [optionName: string]: OptionConfig<Aliases>;
}

/**
 * Names of options that may not be always available in the `ParsedArgv`.
 */
// The option is indefinite if and only if all of the following is true:
//
// 1. A default value is not provided
// 2. The type hint is not 'boolean'
export type IndefiniteOptions<Options extends OptionConfigs> = ValueOf<
  {
    [OptNames in keyof Options]: undefined extends Options[OptNames]["default"]
      ? Options[OptNames]["type"] extends "boolean"
        ? never // No default value && type hint is 'boolean'
        : OptNames // No default value && type hint is not 'boolean'
      : never; // Has default value
  }
>;

/**
 * Names of options that are always available in the `ParsedArgv`.
 */
export type DefiniteOptions<Options extends OptionConfigs> = Exclude<
  keyof Options,
  IndefiniteOptions<Options>
>;

/**
 * Expected type of a single option value, before applying `MaybeArray<>`.
 */
// We don't have a check for 'number' because minimist, mri, and getopts cannot
// coerce an option value to a number.
export type OptionValueType<OptionCfg extends OptionConfig> =
  OptionCfg["type"] extends "boolean"
    ? boolean
    : OptionCfg["type"] extends "string"
    ? string
    : boolean | number | string;

/**
 * Union of all aliases of an option.
 */
export type OptionAlias<OptionCfg extends OptionConfig> =
  OptionCfg["alias"] extends (infer U)[] ? U : never;

// ----------------- ParsedArgv and associated types ------------------------ //

/**
 * Helper type.
 * Extracts a `ParsedArgv` fragment for all aliases of a single option.
 */
export type ParsedArgvAliasUnion<OptionCfg extends OptionConfig> =
  // Use conditional type syntax to distribute the type transformation over each
  // individual type. This is necessary to prevent the option values from being
  // homogenized when OptionCfg is a union of multiple OptionConfig types.
  OptionCfg extends OptionConfig
    ? {
        [Alias in Extract<OptionAlias<OptionCfg>, string>]: MaybeArray<
          OptionValueType<OptionCfg>
        >;
      }
    : never;

/**
 * Generates a `ParsedArgv` fragment.
 * Multiple fragments are intersected to produce the final `ParsedArgv`.
 */
export type ParsedArgvFragment<Options extends OptionConfigs> =
  NormalizeIntersection<
    {
      [Opt in keyof Options]: MaybeArray<OptionValueType<Options[Opt]>>;
    } &
      UnionToIntersection<ParsedArgvAliasUnion<ValueOf<Options>>>
  >;

/**
 * Result of parsing a command line string (or an array of tokens).
 */
export type ParsedArgv<Options extends OptionConfigs> = NormalizeIntersection<
  Partial<ParsedArgvFragment<Pick<Options, IndefiniteOptions<Options>>>> &
    ParsedArgvFragment<Pick<Options, DefiniteOptions<Options>>> & {
      /** All non-option tokens go here. */
      _: string[];
    }
>;
