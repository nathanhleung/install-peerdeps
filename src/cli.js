#!/usr/bin/env node
import "@babel/polyfill";

import { Command } from "commander";
import { confirm } from "promptly";
import clc from "cli-color";

import hasYarn from "./has-yarn";
import pkg from "../package.json";
import installPeerDeps from "./install-peerdeps";
import { parsePackageString } from "./helpers";
import * as C from "./constants";

// Create program object
const program = new Command("install-peerdeps");

// Get relevant package information
const { name, version } = pkg;

/**
 * Error message that is printed when the program can't
 * parse the package string.
 */
function printPackageFormatError() {
  console.log(
    `${C.errorText} Please specify the package to install with peerDeps in the form of \`package\` or \`package@n.n.n\``
  );
  console.log(
    `${C.errorText} At this time you must provide the full semver version of the package.`
  );
  console.log(
    `${C.errorText} Alternatively, omit it to automatically install the latest version of the package.`
  );
}

// Create program
program
  .version(version)
  .description("Installs the specified package along with correct peerDeps.")
  .option("-D", "Install the package as a devDependency (alias for `-d`)")
  .option("-d, --dev", "Install the package as a devDependency")
  .option("-g, --global", "Install the package globally")
  .option("-o, --only-peers", "Install only peerDependencies of the package")
  .option("-S, --silent", "If using npm, don't save in package.json")
  .option("-Y, --yarn", "Install with Yarn")
  .option("-P, --pnpm", "Install with pnpm")
  .option(
    "-n, --no-registry",
    "Use local node_modules instead of a remote registry to get the list of peerDependencies"
  )
  .option(
    "--dry-run",
    "Do not install packages, but show the install command that will be run"
  )
  .option(
    '-x, --extra-args "<extra_args>"',
    "Extra arguments to pass through to NPM or Yarn"
  )
  .usage("<package>[@<version>], default version is 'latest'")
  .parse(process.argv);

// Print program name and version (like what Yarn does)
console.log(clc.bold(`${name} v${version}`));

// Make sure we're installing at least one package
if (program.args.length === 0) {
  console.log(
    `${C.errorText} Please specify a package to install with peerDeps.`
  );
  // An exit code of "9" indicates an invalid argument
  // See https://nodejs.org/api/process.html#process_exit_codes
  process.exitCode = 9;
  program.help();
}

// Make sure we're installing no more than one package
if (program.args.length > 1) {
  console.log(
    `${C.errorText} Too many arguments. Please specify ONE package at a time to install with peerDeps. Alternatively, pass extra arguments with --extra-args "<extra_args>".`
  );
  // An exit code of "9" indicates an invalid argument
  // See https://nodejs.org/api/process.html#process_exit_codes
  process.exit(9);
}

// The first argument after the options is the name of the package
const packageString = program.args[0];

const { packageName, packageVersion } = parsePackageString(packageString);

// If we can't get a package name out,
// print the format error
if (!packageName) {
  printPackageFormatError();
  process.exit(9);
}

// Default package manager is npm
let packageManager = C.npm;
if (program.yarn && program.pnpm) {
  console.log(
    `${C.errorText} Option --yarn and --pnpm cannot be used concurrently.`
  );
  process.exit(9);
}
if (program.yarn) {
  packageManager = C.yarn;
}
if (program.pnpm) {
  packageManager = C.pnpm;
}

// Yarn does not allow silent install of dependencies
if (program.yarn && program.silent) {
  console.log(`${C.errorText} Option --silent cannot be used with --yarn.`);
  process.exit(9);
}

const devMode = program.dev || program.D;
// Dev option can't be used with silent,
// since --dev means it should be saved
// as a devDependency
if (devMode && program.silent) {
  console.log(`${C.errorText} Option --silent cannot be used with --dev.`);
  process.exit(9);
}

// Dev option can't be used with global,
// since --dev means it should be saved
// as a devDependency (locally)
if (devMode && program.silent) {
  console.log(`${C.errorText} Option --dev cannot be used with --global.`);
  process.exit(9);
}

// Define options object to pass to
// the installPeerDeps function
const options = {
  packageName,
  // If packageVersion is undefined, default to "latest"
  version: packageVersion || "latest",
  noRegistry: program.noRegistry,
  dev: devMode,
  global: program.global,
  onlyPeers: program.onlyPeers,
  silent: program.silent,
  packageManager,
  dryRun: program.dryRun,
  auth: program.auth,
  // Args after -- will be passed through
  extraArgs: program.extraArgs || ""
};

// Disabled this rule so we can hoist the callback
/* eslint-disable no-use-before-define */

// Check if the user has Yarn but didn't specify the Yarn option
// However, don't show prompt if user wants to install silently
if (hasYarn() && packageManager !== C.yarn && !program.silent) {
  // If they do, ask if they want to use Yarn
  confirm(
    "It seems as if you are using Yarn. Would you like to use Yarn for the installation? (y/n)"
  )
    .then(value => {
      // Value is true or false; if true, they want to use Yarn
      if (value) {
        packageManager = C.yarn;
      }
      // Now install, but with the new packageManager
      installPeerDeps({ ...options, packageManager }, installCb);
    })
    .catch(err => {
      if (err) {
        console.log(`${C.errorText} ${err.message}`);
        process.exit(1);
      }
    });
} else {
  // If they don't have Yarn or they've already
  // opted to use Yarn, go ahead and install
  installPeerDeps(options, installCb);
}

/**
 * Callback which is called after the installation
 * process finishes
 * @callback
 * @param {Error} [err] - the error, if any, that occurred during installation
 */
function installCb(err) {
  if (err) {
    console.log(`${C.errorText} ${err.message}`);
    process.exit(1);
  }
  let successMessage = `${C.successText} ${packageName}
  and its peerDeps were installed successfully.`;
  if (program.onlyPeers) {
    successMessage = `${C.successText} The peerDeps of ${packageName} were installed successfully.`;
  }
  console.log(successMessage);
  process.exit(0);
}
/* eslint-enable */

export default program;
