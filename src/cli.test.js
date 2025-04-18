import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import test from "tape";

/**
 * Spawns the CLI with the provided arguments
 * @param {string[]} extraArgs - arguments to be passed to the CLI
 * @param {string} cwd - the fixtures directory to run the command in
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
      ...["--require", "@babel/register", path.join(__dirname, "cli.js")],
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
 * Gets the resulting CLI dry-run output given the provided arguments
 * @async
 * @param {string[]} extraArgs - arguments to be passed to the CLI
 * @param {string} cwd - the fixtures directory to run the command in
 * @returns {Promise<[number, string, string]>} - a Promise which resolves to an array contaning [exit code, stderr, stdout]
 */
async function getCliOutput(extraArgs, cwd = "sandbox") {
  return new Promise((resolve, reject) => {
    // Always do dry run, so the command is the last
    // non-whitespace line written to stdout
    const cli = spawnCli([...extraArgs, "--dry-run"], cwd);
    const fullstdout = [];
    const fullstderr = [];
    cli.stdout.on("data", (data) => {
      // not guaranteed to be line-by-line in fact these can be Buffers
      fullstdout.push(String(data));
    });
    cli.stderr.on("data", (data) => {
      // not guaranteed to be line-by-line in fact these can be Buffers
      fullstderr.push(String(data));
    });
    cli.on("close", (code) => {
      resolve([code, fullstderr.join(""), fullstdout.join("")]);
    });
    // Make sure to call reject() on error so that the Promise
    // doesn't hang forever
    cli.on("error", (err) => reject(err));
  });
}

/**
 * Gets the resulting dry-run install command given the provided arguments
 * @async
 * @param {string[]} extraArgs - arguments to be passed to the CLI
 * @param {string} cwd - the fixtures directory to run the command in
 * @returns {Promise<string>} - a Promise which resolves to the resulting install command
 */
async function getCliInstallCommand(extraArgs, cwd = "sandbox") {
  const [code, stderr, stdout] = await getCliOutput(extraArgs, cwd);
  if (code !== 0) {
    throw new Error(`Unsuccessful exit code. ${stderr}`);
  }

  // The command will be the last non-whitespace line written to
  // stdout by the cli during a dry run
  const lines = stdout.split(/\r?\n/g).filter((l) => !!l.trim());

  return lines[lines.length - 1];
}

test("errors when more than one package is provided", (t) => {
  const cli = spawnCli(["eslint-config-airbnb", "angular"]);
  cli.on("exit", (code) => {
    // We should be able to do t.equal(code, 1), but earlier Node versions
    // handle uncaught exceptions differently so we can't (0.10 returns 8,
    // 0.12 returns 9).
    t.notEqual(code, 0, `errored, exit code was ${code}.`);
    t.end();
  });
});

test("errors when no arguments are provided", (t) => {
  const cli = spawnCli([]);
  cli.on("exit", (code) => {
    t.notEqual(code, 0, `errored, exit code was ${code}`);
    t.end();
  });
});

test("errors when the package name argument is formatted incorrectly", (t) => {
  const cli = spawnCli(["heyhe#@&*()"]);
  cli.on("exit", (code) => {
    t.notEqual(code, 0, `errored, exit code was ${code}`);
    t.end();
  });
});

test("installs a package with no peer dependencies without errors, but prints a warning", async (t) => {
  t.plan(2);
  try {
    const [, stderr] = await getCliOutput(["postcss@^8.1.0"]);
    t.equal(/\bno peer dependencies\b/i.test(stderr), true);
    t.equal(/\binstalling anyway\b/i.test(stderr), true);
  } catch (err) {
    t.fail(err);
  }
});

test("installs successfully when a version range is provided that results in `npm info` returning an array", async (t) => {
  t.plan(1);
  try {
    const command = await getCliInstallCommand(["postcss@^8.1.0"]);
    t.equal(/\bpostcss\b/.test(command), true);
  } catch (err) {
    t.fail(err);
  }
});

test("only installs peerDependencies when `--only-peers` is specified", async (t) => {
  t.plan(1);
  try {
    const command = await getCliInstallCommand([
      "eslint-config-airbnb",
      "--only-peers"
    ]);
    t.equal(/ eslint-config-airbnb /.test(command), false);
  } catch (err) {
    t.fail(err);
  }
});

test("adds explicit `--save-dev` flag when using `-D, -d, --dev` with npm", async (t) => {
  const flags = ["-D", "-d", "--dev"];
  t.plan(flags.length);
  try {
    const commands = await Promise.all(
      flags.map((flag) => getCliInstallCommand(["eslint-config-airbnb", flag]))
    );
    commands.forEach((command, i) =>
      t.equal(/ --save-dev\b/.test(command), true, `flag: \`${flags[i]}\``)
    );
  } catch (err) {
    t.fail(err);
  }
});

test("places `global` as first arg following `yarn` when using yarn and `--global` is specified", async (t) => {
  t.plan(1);
  try {
    const command = await getCliInstallCommand([
      "eslint-config-airbnb",
      "--global",
      "-Y"
    ]);
    t.equal(/^yarn global/.test(command), true);
  } catch (err) {
    t.fail(err);
  }
});

test("adds explicit `--global` flag when using `--global` with npm", async (t) => {
  t.plan(1);
  try {
    const command = await getCliInstallCommand([
      "eslint-config-airbnb",
      "--global"
    ]);
    t.equal(/\bnpm\s--global\b/.test(command), true);
  } catch (err) {
    t.fail(err);
  }
});

test("does not add `--save` when using `--global` with npm", async (t) => {
  t.plan(1);
  try {
    const command = await getCliInstallCommand([
      "eslint-config-airbnb",
      "--global"
    ]);
    t.equal(/\s--save\b/.test(command), false);
  } catch (err) {
    t.fail(err);
  }
});

test("grabs peer dependencies from the local `node_modules` directory when using `--no-registry`", async (t) => {
  t.plan(2);
  try {
    const command = await getCliInstallCommand(
      ["dummy-local-package", "--no-registry"],
      "no-registry"
    );

    t.equal(/\sdummy-local-package@/.test(command), true);
    t.equal(/\sdummy-peer-dependency@\^1\.0\.0\s/.test(command), true);
  } catch (err) {
    t.fail(err);
  }
});

test("adds an explicit `--no-save` when using `--silent` with npm", async (t) => {
  t.plan(1);
  try {
    const command = await getCliInstallCommand([
      "eslint-config-airbnb",
      "--silent"
    ]);
    t.equal(/\s--no-save\b/.test(command), true);
  } catch (err) {
    t.fail(err);
  }
});

test("installs with pnpm successfully", (t) => {
  const cli = spawnCli(["eslint-config-airbnb", "--pnpm"], "pnpm");
  cli.on("data", (data) => {
    t.comment(data);
  });
  cli.on("exit", (code) => {
    if (code !== 0) {
      t.fail(`CLI exited with error code ${code}`);
    }
    const pnpmLockYamlPath = path.resolve(
      __dirname,
      "..",
      "fixtures",
      "pnpm",
      "pnpm-lock.yaml"
    );
    const hasPnpmLockYaml = fs.existsSync(pnpmLockYamlPath);
    t.equal(hasPnpmLockYaml, true);
    // Delete pnpm-lock.yaml file
    try {
      fs.unlinkSync(pnpmLockYamlPath);
    } catch (e) {
      /**/
    }
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
