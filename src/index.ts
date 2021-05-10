import getopts from "getopts";
import { parseArgsStringToArgv as stringArgv } from "string-argv";
import type { OptionConfigs, ParsedArgv } from "./types.js";

/**
 * Naive ponyfill of `Object.entries()`.
 */
function objectEntries<Keys extends string, Values>(
  obj: { [key in Keys]: Values }
) {
  return Object.keys(obj).map((key) => [key, obj[key as keyof typeof obj]]) as [
    Keys,
    Values
  ][];
}

// Explicitly set the prototype, so that 'instanceof' still works in Node.js
// even when the class is transpiled down to ES5
export class ConfigError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}
ConfigError.prototype.name = "ConfigError";

export class CliError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    Object.setPrototypeOf(this, CliError.prototype);
  }
}
CliError.prototype.name = "CliError";

interface ParserConfig<Options extends OptionConfigs> {
  name: string;
  options: Options;
}

class Parser<Options extends OptionConfigs> {
  readonly #name: string;
  readonly #options: Options;

  constructor(config: ParserConfig<Options>) {
    this.#name = config.name;
    this.#options = config.options;

    // Config validation
    // All options and aliases must be unique
    const optionsSeen = new Set<string>();
    for (const name in config.options) {
      if (optionsSeen.has(name)) {
        throw new ConfigError(`Duplicate option name: ${name}`);
      }
      optionsSeen.add(name);

      for (const alias of config.options[name].alias || []) {
        if (optionsSeen.has(alias)) {
          throw new ConfigError(`Duplicate option alias: ${alias}`);
        }
        optionsSeen.add(alias);
      }
    }
  }

  /**
   * @param argv Argument string or an array of strings
   * @throws {CliError} If an unknown option is encountered.
   */
  parse(argv: string | string[]) {
    if (!Array.isArray(argv)) argv = stringArgv(argv);

    const options = this.#options;
    const optionNames = Object.keys(options);

    return getopts(argv, {
      alias: optionNames.reduce((aliasObj, name) => {
        // Each option must be present in the alias object, even if it has no
        // alias. This ensures that unknown() is not called for any known
        // options.
        aliasObj[name] = options[name].alias || [];
        return aliasObj;
      }, {} as Record<string, string[]>),
      default: optionNames.reduce((defaultObj, name) => {
        const defaultValue = options[name].default;
        if (defaultValue !== undefined) {
          defaultObj[name] = defaultValue;
        }
        return defaultObj;
      }, {} as Record<string, boolean | number | string>),
      boolean: optionNames.filter((name) => options[name].type === "boolean"),
      string: optionNames.filter((name) => options[name].type === "string"),
      unknown: (option) => {
        throw new CliError(`Unknown option: ${option}`);
      },
    }) as ParsedArgv<Options>;
  }

  generateHelp() {
    let helpMessage = `Usage
  ${this.#name} [options]

Options\n`;

    // Temporary array used to construct option description messages
    const optionData = objectEntries(this.#options).map(([name, config]) => {
      const nameAndAliases = config.alias ? [name, ...config.alias] : [name];
      return {
        concatenatedOptions: nameAndAliases
          .map((name) => (name.length === 1 ? "-" + name : "--" + name))
          .join(", "),
        config,
      };
    });

    // Use longest option length to align descriptions
    const maxLength = Math.max(
      0,
      ...optionData.map((p) => p.concatenatedOptions.length)
    );
    helpMessage += optionData
      .map((p) => {
        const padded = p.concatenatedOptions.padEnd(maxLength);
        const line = `  ${padded}    ${p.config.description}`;
        return p.config.default == null
          ? line
          : `${line} (default: ${String(p.config.default)})`;
      })
      .join("\n");

    return helpMessage;
  }
}

export default function createParser<
  AliasType extends string,
  Options extends OptionConfigs<AliasType>
>(config: ParserConfig<Options>): Parser<Options> {
  return new Parser(config);
}
