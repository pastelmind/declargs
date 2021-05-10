# declargs

[![Build & Test](https://github.com/pastelmind/declargs/actions/workflows/build.yml/badge.svg)](https://github.com/pastelmind/declargs/actions/workflows/build.yml) [![NPM Package](https://badgen.net/npm/v/declargs)](https://npmjs.com/package/declargs)

declargs is a minimal, declarative, TypeScript-first command-line argument parser library.

## Why another argument parser?

There are many, many JavaScript command-line argument parsers out there:
[arg], [argparse], [args], [caporal], [clap], [command-line-args], [commander], [dashdash], [getopts], [meow], [minimist], [mri], [optimist], [optionator], [sade], [yargs-parser], [yargs], ...

However, none of them fit my particular need:

1. Isomorphic: No Node.js-specific APIs must be used
2. Work on exotic, old JS runtimes (e.g. [Rhino]): No use of `setTimeout()`, promises, or `async`/`await`
3. Can generate a help message
4. Infer correct type signature of the parsed options

This is why I built declargs.

[rhino]: https://github.com/mozilla/rhino
[arg]: https://github.com/vercel/arg/
[argparse]: https://github.com/nodeca/argparse/
[args]: https://github.com/leo/args/
[caporal]: https://github.com/mattallty/Caporal.js/
[clap]: https://github.com/lahmatiy/clap/
[command-line-args]: https://github.com/75lb/command-line-args/
[commander]: https://github.com/tj/commander.js/
[dashdash]: https://github.com/trentm/node-dashdash/
[getopts]: https://github.com/jorgebucaran/getopts/
[meow]: https://github.com/sindresorhus/meow/
[minimist]: https://github.com/substack/minimist/
[mri]: https://github.com/lukeed/mri/
[optimist]: https://github.com/substack/node-optimist/
[optionator]: https://github.com/gkz/optionator/
[sade]: https://github.com/lukeed/sade/
[yargs-parser]: https://github.com/yargs/yargs-parser/
[yargs]: https://github.com/yargs/yargs/

## Usage

declargs is a native ESM-only package. Sorry, CommonJS!

```ts
import declargs from "declargs";

const parser = declargs({
  name: "helloworld",
  options: {
    foo: {
      description: "This is foo",
      alias: ["f"],
    },
    "say-hello": {
      description: 'When given, the program will say "Hello".',
      default: false,
      type: "boolean",
    },
  },
});

// In Node.js...
const options = parser.parse(process.argv.slice(2));
// In browser...
const options = parser.parse("-f something --say-hello");
```

declargs works best with object literals. It uses the type information to build a correct shape for the output:

```ts
// Will pass type tests
const foo = options.foo;
const f = options.f;
const sayHello = options["say-hello"];
const rest = options._;

// Will fail in TypeScript
const bar = options.bar;
```

## API

declargs exports a single factory function: `declargs(cfg)`.

### `declargs(cfg)`

Factory function for the parser. Returns the created `parser` object.

#### `cfg.name`

Name of the script. Used in the "Usage" section of the generated help text.

#### `cfg.options`

An object that maps each command line option to its option config object.

Each option config object looks like this:

```ts
interface OptionConfig {
  // Required. A string that describes the option.
  description: string;
  // Optional. Array of aliases for this option.
  alias?: string[];
  // Optional. Default value for this option if it is omitted.
  // Note that a 'string' type option must be given a string value, and a
  // 'boolean' type option must be given a boolean value.
  default?: boolean | number | string;
  // Optional. A string constant that forces the parser to treat the option
  // value as a boolean or string.
  // (There is no constant for 'number')
  type?: "boolean" | "string";
}
```

### `parser.parse(argv)`

Parses a command line string or an array of string tokens and returns an object containing the parsed options.

Alised options will expose every alias as the property of the returned object.
Any non-option tokens are returned inside the special `_` property.

#### `argv`

A string containing the command line, or an array of strings.

If you use `process.argv`, you must slice it yourself before passing it to declargs.

### `parser.generateHelp()`

Returns a formatted help message as a string.

```ts
const parser = declargs({
  name: "helloworld",
  options: {
    foo: {
      description: "This is foo",
      alias: ["f"],
    },
    "say-hello": {
      description: 'When given, the program will say "Hello".',
      default: false,
      type: "boolean",
    },
  },
});
console.log(parser.generateHelp());
```

Will give:

```
Usage
  helloworld [options]

Options
  --foo, -f                   This is foo
  --say-hello, --hello, -s    The program will say "Hello". (default: false)
```
