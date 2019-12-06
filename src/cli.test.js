import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import test from "tape";

/**
 * Spawns the CLI with the provided arguments
 * @param {string[]} extraArgs - arguments to be passed to the CLI
 * @returns {ChildProcess} - an EventEmitter that represents the spawned child process
 */
function spawnCli(extraArgs, cwd = "sandbox") {
  const fullCwd = path.join(__dirname, "..", "fixtures", cwd);

  // Clean up sandbox before and after every run
  if (cwd === "sandbox") {
    fs.copyFileSync(
      path.join(fullCwd, "package-clean.json"),
      path.join(fullCwd, "package.json")
    );
  }

  const cli = spawn(
    "node",
    [
      ...["--require", "babel-register", path.join(__dirname, "cli.js")],
      ...extraArgs
    ],
    { cwd: fullCwd }
  );

  // Clean up sandbox before and after every run
  cli.on("exit", () => {
    if (cwd === "sandbox") {
      fs.copyFileSync(
        path.join(fullCwd, "package-clean.json"),
        path.join(fullCwd, "package.json")
      );
    }
  });

  return cli;
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
    const cli = spawnCli([...extraArgs, "--dry-run"]);
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
  const cli = spawnCli([]);
  cli.on("exit", code => {
    t.notEqual(code, 0, `errored, exit code was ${code}`);
    t.end();
  });
});

test("errors when the package name argument is formatted incorrectly", t => {
  const cli = spawnCli(["heyhe#@&*()"]);
  cli.on("exit", code => {
    t.notEqual(code, 0, `errored, exit code was ${code}`);
    t.end();
  });
});

test("only installs peerDependencies when `--only-peers` is specified", t => {
  getCliInstallCommand(["eslint-config-airbnb", "--only-peers"]).then(
    command => {
      const cmd = command.toString();
      t.equal(/ eslint-config-airbnb /.test(cmd), false);
      t.end();
    },
    t.fail
  );
});

test("adds explicit `--save-dev` flag when using `-D, -d, --dev` with NPM", t => {
  const flags = ["-D", "-d", "--dev"];
  Promise.all(
    flags.map(flag => getCliInstallCommand(["eslint-config-airbnb", flag]))
  )
    .then(commands => {
      commands.forEach((cmd, i) =>
        t.equal(/ --save-dev /.test(cmd), true, `flag: \`${flags[i]}\``)
      );
      t.end();
    })
    .catch(t.fail);
});

test("places `global` as first arg following `yarn` when using yarn and `--global` is specified", t => {
  getCliInstallCommand(["eslint-config-airbnb", "--global", "-Y"]).then(
    command => {
      const cmd = command.toString();
      t.equal(/^yarn global/.test(cmd), true);
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

test("installs with pnpm successfully", t => {
  const cli = spawnCli(["eslint-config-airbnb", "--pnpm"], "pnpm");
  cli.on("data", data => {
    t.comment(data);
  });
  cli.on("exit", code => {
    if (code !== 0) {
      t.fail(`CLI exited with error code ${code}`);
    }
    const hasPnpmLockYaml = fs.existsSync(
      path.resolve(__dirname, "..", "fixtures", "pnpm", "pnpm-lock.yaml")
    );
    t.equal(hasPnpmLockYaml, true);
    t.end();
  });
});

// See https://github.com/nathanhleung/install-peerdeps/issues/33
// test("installs packages correctly even if package name ends with '-0'", t => {
//   const cli = spawnCli(["enzyme-adapter-react-16@1.1.1"]);
//   cli.on("exit", code => {
//     t.equal(code, 0, `errored, exit code was ${code}.`);
//     t.end();
//   });
// });

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
