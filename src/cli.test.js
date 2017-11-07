import { spawn } from "child_process";
// Doesn't work with Jest, for some reason
// @todo
// import program from './cli';

function spawnCli(extraArgs) {
  return spawn(
    "node",
    ["--require", "babel-register", "cli.js"].concat(extraArgs)
  );
}

function getCliInstallCommand(extraArgs, cb) {
  // Always do dry run, so the command is the last line
  // outputted
  const cli = spawnCli(extraArgs.concat("--dry-run"));
  const lines = [];
  cli.stdout.on("data", data => {
    lines.push(data);
  });
  cli.on("close", () =>
    // The command will be the last line outputted by the cli
    // during a dry run
    cb(lines[lines.length - 1])
  );
}

it("errors when more than one package is provided", () => {
  const cli = spawnCli(["eslint-config-airbnb", "angular"]);
  cli.on("exit", code => {
    expect(code).toBe(1);
  });
});

it("errors when no arguments are provided", () => {
  const cli = spawnCli();
  cli.on("exit", code => {
    expect(code).toBe(1);
  });
});

it("errors when the package name argument is formatted incorrectly", () => {
  const cli = spawnCli("heyhe#@&*()");
  cli.on("exit", code => {
    expect(code).toBe(1);
  });
});

it("only installs peerDependencies when `--only-peers` is specified", () => {
  getCliInstallCommand(["eslint-config-airbnb", "--only-peers"], command => {
    expect(command).not.stringMatching(/\beslint-config-airbnb\b/);
  });
});

it("adds an explicit `--no-save` when using `--silent` with NPM", () => {
  getCliInstallCommand(["eslint-config-airbnb", "--silent"], command => {
    expect(command).stringMatching(/\b--no-save\b/);
  });
});

// @todo - tests for the actual install process
// see https://github.com/sindresorhus/has-yarn/blob/master/test.js for details
// Perhaps abstract the functionality of getting the package name
// into its own function, and test that

// Also see commander tests
// https://github.com/tj/commander.js/blob/master/test/test.arguments.js
