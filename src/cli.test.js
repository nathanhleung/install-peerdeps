import { spawn } from "child_process";
import test from "tape";

/**
 * Spawns the CLI with the provided arguments
 * @param {string[]} extraArgs - arguments to be passed to the CLI
 * @returns {ChildProcess} - an EventEmitter that represents the spawned child process
 */
function spawnCli(extraArgs) {
  return spawn(
    "node",
    ["--require", "babel-register", "cli.js"].concat(extraArgs)
  );
}

/**
 * Gets the resulting install command given the provided arguments
 * @async
 * @param {string[]} extraArgs - arguments to be passed to the CLI
 * @returns {Promise<string>} - a Promise which resolves to the resulting install command
 */
async function getCliInstallCommand(extraArgs) {
  return new Promise((resolve, reject) => {
    // Always do dry run, so the command is the last line
    // outputted
    const cli = spawnCli(extraArgs.concat("--dry-run"));
    const lines = [];
    cli.stdout.on("data", data => {
      lines.push(data);
    });
    cli.on("close", () => {
      // The command will be the last line outputted by the cli
      // during a dry run
      resolve(lines[lines.length - 1]);
    });
    // Make sure to call reject() on error so that the Promise
    // doesn't hang forever
    cli.on("error", err => reject(err));
  });
}

test("errors when more than one package is provided", t => {
  // Declare # of assertions before every test to ensure assertions
  // are run - this prevents async/callback errors where expect() is
  // never called
  t.plan(1);
  const cli = spawnCli(["eslint-config-airbnb", "angular"]);
  cli.on("exit", code => {
    t.equal(code, 1);
  });
});

test("errors when no arguments are provided", t => {
  t.plan(1);
  const cli = spawnCli();
  cli.on("exit", code => {
    t.equal(code, 1);
  });
});

test("errors when the package name argument is formatted incorrectly", t => {
  t.plan(1);
  const cli = spawnCli("heyhe#@&*()");
  cli.on("exit", code => {
    t.equal(code, 1);
  });
});

test("only installs peerDependencies when `--only-peers` is specified", t => {
  t.plan(1);
  getCliInstallCommand(["eslint-config-airbnb", "--only-peers"]).then(
    command => {
      t.equal(/\beslint-config-airbnb\b/.test(command), false);
    },
    t.fail
  );
});

test("adds an explicit `--no-save` when using `--silent` with NPM", t => {
  t.plan(1);
  getCliInstallCommand(["eslint-config-airbnb", "--silent"]).then(command => {
    t.equal(/\b--no-save\b/.test(command), false);
  }, t.fail);
});

// @todo - tests for the actual install process
// see https://github.com/sindresorhus/has-yarn/blob/master/test.js for details
// Perhaps abstract the functionality of getting the package name
// into its own function, and test that

// Also see commander tests
// https://github.com/tj/commander.js/blob/master/test/test.arguments.js
