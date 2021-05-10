/// <reference types="../node-fix" />
import { strict as assert } from "node:assert";
import declargs, { CliError } from "../src/index.js";

describe("parse()", () => {
  it("should parse options correctly", () => {
    const parser = declargs({
      name: "helloworld",
      options: {
        foo: {
          description: "This is foo",
        },
        "say-hello": {
          description: 'When given, the program will say "Hello".',
          default: false,
          type: "boolean",
        },
      },
    });

    assert.deepEqual(parser.parse("--foo bar"), {
      _: [],
      foo: "bar",
      "say-hello": false,
    });
  });

  it("should not provide defaults for missing options", () => {
    const parser = declargs({
      name: "helloworld",
      options: {
        foo: {
          description: "This is foo",
        },
        bar: {
          description: "This is bar",
        },
      },
    });

    assert.deepEqual(parser.parse("--bar"), {
      _: [],
      bar: true,
    });
  });

  it("should reject unknown options", () => {
    const parser = declargs({
      name: "helloworld",
      options: {
        foo: {
          description: "This is foo",
        },
      },
    });

    assert.throws(
      () => parser.parse("--unknown-option"),
      new CliError("Unknown option: unknown-option")
    );
  });

  it("should ignore tokens after boolean options", () => {
    const parser = declargs({
      name: "helloworld",
      options: {
        "say-hello": {
          description: 'When given, the program will say "Hello".',
          default: false,
          type: "boolean",
        },
      },
    });

    assert.deepEqual(parser.parse("--say-hello bus factor"), {
      _: ["bus", "factor"],
      "say-hello": true,
    });
  });

  it("should always provide default values for boolean options", () => {
    const parser = declargs({
      name: "helloworld",
      options: {
        "bool-option": {
          description: "A boolean option",
          type: "boolean",
        },
        "aliased-bool-option": {
          description: "A boolean option",
          type: "boolean",
          alias: ["a", "abo"],
        },
      },
    });

    assert.deepEqual(parser.parse([]), {
      _: [],
      "bool-option": false,
      "aliased-bool-option": false,
      a: false,
      abo: false,
    });
  });
});

describe("generateHelp()", () => {
  it("should correctly generate a help message", () => {
    const parser = declargs({
      name: "helloworld",
      options: {
        foo: {
          alias: ["f"],
          description: "This is foo",
        },
        "say-hello": {
          alias: ["hello", "s"],
          description: 'The program will say "Hello".',
          default: false,
          type: "boolean",
        },
      },
    });

    assert.equal(
      parser.generateHelp(),
      `Usage
  helloworld [options]

Options
  --foo, -f                   This is foo
  --say-hello, --hello, -s    The program will say "Hello". (default: false)`
    );
  });
});
