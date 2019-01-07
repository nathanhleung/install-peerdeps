import { spawn } from "child_process";
import path from "path";
import test from "tape";
// import fs from "fs";

/**
 * Spawns the CLI with the provided arguments
 * @param {string[]} extraArgs - arguments to be passed to the CLI
 * @returns {ChildProcess} - an EventEmitter that represents the spawned child process
 */
function spawnCli(extraArgs, cwd = "sandbox") {
  return spawn(
    "node",
    ["--require", "babel-register", path.join(__dirname, "cli.js")].concat(
      extraArgs
    ),
    { cwd: path.join(__dirname, "..", "fixtures", cwd) }
  );
}

/**
 * Gets the resulting install command given the provided arguments
 * @async
 * @param {string[]} extraArgs - arguments to be passed to the CLI
 * @param {boolean} noDryRun - whether to actually run the command or not
 * @returns {Promise<string>} - a Promise which resolves to the resulting install command
 */
async function getCliInstallCommand(extraArgs) {
  return new Promise((resolve, reject) => {
    // Always do dry run, so the command is the last
    // non-whitespace line written to stdout
    const cli = spawnCli(extraArgs.concat("--dry-run"));
    const fullstdout = [];
    cli.stdout.on("data", data => {
      // not guaranteed to be line-by-line in fact these can be Buffers
      fullstdout.push(data);
    });
    cli.on("close", () => {
      // The command will be the last non-whitespace line written to
      // stdout by the cli during a dry run

      const lines = fullstdout
        .join("")
        .split(/\r?\n/g)
        .filter(l => !!l.trim());

      resolve(lines[lines.length - 1]);
    });
    // Make sure to call reject() on error so that the Promise
    // doesn't hang forever
    cli.on("error", err => reject(err));
  });
}

test("errors when more than one package is provided", t => {
  const cli = spawnCli(["eslint-config-airbnb", "angular"]);
  cli.on("exit", code => {
    // We should be able to do t.equal(code, 1), but earlier Node versions
    // handle uncaught exceptions differently so we can't (0.10 returns 8,
    // 0.12 returns 9).
    t.notEqual(code, 0, `errored, exit code was ${code}.`);
    t.end();
  });
});

test("errors when no arguments are provided", t => {
  const cli = spawnCli();
  cli.on("exit", code => {
    t.notEqual(code, 0, `errored, exit code was ${code}`);
    t.end();
  });
});

test("errors when the package name argument is formatted incorrectly", t => {
  const cli = spawnCli("heyhe#@&*()");
  cli.on("exit", code => {
    t.notEqual(code, 0, `errored, exit code was ${code}`);
    t.end();
  });
});

test("only installs peerDependencies when `--only-peers` is specified", t => {
  getCliInstallCommand(["eslint-config-airbnb", "--only-peers"]).then(
    command => {
      const cmd = command.toString();
      t.equal(/\beslint-config-airbnb\b/.test(cmd), false);
      t.end();
    },
    t.fail
  );
});

test("places `global` as first arg following `yarn` when using yarn and `--global` is specified", t => {
  getCliInstallCommand(["eslint-config-airbnb", "--global", "-Y"]).then(
    command => {
      const cmd = command.toString();
      t.equal(/\byarn global\b/.test(cmd), true);
      t.end();
    },
    t.fail
  );
});

test("adds explicit `--global` flag when using `--global` with NPM", t => {
  getCliInstallCommand(["eslint-config-airbnb", "--global"]).then(command => {
    const cmd = command.toString();
    t.equal(/\bnpm\s--global\b/.test(cmd), true);
    t.end();
  }, t.fail);
});

test("does not add `--save` when using `--global` with NPM", t => {
  getCliInstallCommand(["eslint-config-airbnb", "--global"]).then(command => {
    const cmd = command.toString();
    t.equal(/\s--save\b/.test(cmd), false);
    t.end();
  }, t.fail);
});

test("adds an explicit `--no-save` when using `--silent` with NPM", t => {
  getCliInstallCommand(["eslint-config-airbnb", "--silent"]).then(command => {
    const cmd = command.toString();
    t.equal(/\s--no-save\b/.test(cmd), true);
    t.end();
  }, t.fail);
});

test("installs packages correctly even if package name ends with '-0'", t => {
  const cli = spawnCli(["enzyme-adapter-react-16@1.1.1"]);
  cli.on("exit", code => {
    t.equal(code, 0, `errored, exit code was ${code}.`);
    t.end();
  });
});

// Work on this test later
/*
test("doesn't replace existing installed peer dependencies", t => {
  const fullCwd = path.join(__dirname, "..", "fixtures", "replace");

  const npm = spawn("npm", ["install", "data-forge"], {
    cwd: fullCwd
  });

  function onCliExit(code, forgeVersion) {
    if (code !== 0) {
      t.fail(`errored, cli exit code was ${code}.`);
    }

    fs.readFile(`${fullCwd}/package.json`, "utf8", (err, data) => {
      if (err) {
        t.fail(`errored, couldn't open package.json`);
      }

      const pkg = JSON.parse(data);
      const newForgeVersion = pkg.dependencies["data-forge"];

      t.equal(
        newForgeVersion,
        forgeVersion,
        `error, replaced old peer. ${newForgeVersion} replaced ${forgeVersion}`
      );
    });
  }

  npm.on("exit", code => {
    if (code !== 0) {
      t.fail(`errored, npm install exit code was ${code}.`);
    }

    fs.readFile(`${fullCwd}/package.json`, "utf8", (err, data) => {
      if (err) {
        t.fail(`errored, couldn't open package.json`);
      }

      const pkg = JSON.parse(data);
      const forgeVersion = pkg.dependencies["data-forge"];

      const cli = spawnCli(["data-forge-indicators"], "replace");
      cli.on("exit", cliExitCode => onCliExit(cliExitCode, forgeVersion));
    });
  });
});
*/

// @todo - tests for the actual install process
// see https://github.com/sindresorhus/has-yarn/blob/master/test.js for details
// Perhaps abstract the functionality of getting the package name
// into its own function, and test that

// Also see commander tests
// https://github.com/tj/commander.js/blob/master/test/test.arguments.js
