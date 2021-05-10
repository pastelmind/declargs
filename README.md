# declargs

[![Build & Test](https://github.com/pastelmind/declargs/actions/workflows/build.yml/badge.svg)](https://github.com/pastelmind/declargs/actions/workflows/build.yml) [![NPM Package](https://badgen.net/npm/v/declargs)](https://badgen.net/npm/v/declargs)

declargs is a minimal, declarative, TypeScript-first command-line argument parser library. It wraps [getopts] and provides

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

declargs exports a single factory function: `declargs()`.

### parse()

### generateHelp()

Returns a formatted help message as a string.

```ts
parser = declargs({
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
