import { spawn } from "child_process";

// Set long timeout in case network requests run long
jest.setTimeout(60000);

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
    cli.on("close", () =>
      // The command will be the last line outputted by the cli
      // during a dry run
      resolve(lines[lines.length - 1])
    );
    // Make sure to call reject() on error so that the Promise
    // doesn't hang forever
    cli.on("error", err => reject(err));
  });
}

it("errors when more than one package is provided", done => {
  // Declare # of assertions before every test to ensure assertions
  // are run - this prevents async/callback errors where expect() is
  // never called
  expect.assertions(1);
  const cli = spawnCli(["eslint-config-airbnb", "angular"]);
  cli.on("exit", code => {
    expect(code).toBe(1);
    done();
  });
});

it("errors when no arguments are provided", done => {
  expect.assertions(1);
  const cli = spawnCli();
  cli.on("exit", code => {
    expect(code).toBe(1);
    done();
  });
});

it("errors when the package name argument is formatted incorrectly", done => {
  expect.assertions(1);
  const cli = spawnCli("heyhe#@&*()");
  cli.on("exit", code => {
    expect(code).toBe(1);
    done();
  });
});

it("only installs peerDependencies when `--only-peers` is specified", async () => {
  expect.assertions(1);
  const command = await getCliInstallCommand([
    "eslint-config-airbnb",
    "--only-peers"
  ]);
  expect(command).not.toEqual(
    expect.stringMatching(/\beslint-config-airbnb\b/)
  );
});

it("adds an explicit `--no-save` when using `--silent` with NPM", async () => {
  expect.assertions(1);
  const command = await getCliInstallCommand([
    "eslint-config-airbnb",
    "--silent"
  ]);
  expect(command).not.toEqual(expect.stringMatching(/\b--no-save\b/));
});

it("installs peerDeps correctly even when they are specified as ranges", async () => {
  expect.assertions(1);
  const command = await getCliInstallCommand(["eslint-config-airbnb"]);

  expect(command).toBe("yarn");
});

// @todo - tests for the actual install process
// see https://github.com/sindresorhus/has-yarn/blob/master/test.js for details
// Perhaps abstract the functionality of getting the package name
// into its own function, and test that

// Also see commander tests
// https://github.com/tj/commander.js/blob/master/test/test.arguments.js
