import declargs from "./src/index.js";

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
    fuzzy: {
      description: "This is just for testing",
      type: "boolean",
      alias: ["u", "FUZZY"],
    },
    help: {
      description: "Show this message",
      alias: ["h"],
    },
  },
});

console.log("process.argv: %o", process.argv);
console.log("-".repeat(80));

const options = parser.parse(process.argv.slice(2));
console.log("options: %o", options);
console.log("-".repeat(80));

console.log(parser.generateHelp());
