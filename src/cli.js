#!/usr/bin/env node
import { Command } from 'commander';
import { confirm } from 'promptly';
import hasYarn from 'has-yarn';
import clc from 'cli-color';
import pkg from '../package.json';
import installPeerDeps from './installPeerDeps';
import * as C from './constants';

// Create program object
const program = new Command('install-peerdeps');

// Create prefixes for error/sucess events
const errorText = clc.red.bold('ERR');
const successText = clc.green.bold('SUCCESS');

// Get relevant package information
const name = pkg.name;
const version = pkg.version;

// This is used a couple of times, so just putting
// it into a function so I don't have to copy it like
// 3 times
function printPackageFormatError() {
  console.log(`${errorText} Please specify the package to install with peerDeps in the form of \`package\` or \`package@n.n.n\``);
  console.log(`${errorText} At this time you must provide the full semver version of the package.`);
  console.log(`${errorText} Alternatively, omit it to automatically install the latest version of the package.`);
}

// Create program
program
  .version(version)
  .description('Installs the specified package along with correct peerDeps.')
  .option('-d, --dev', 'Install the package as a devDependency')
  .option('-S, --silent', 'If using npm, don\'t save in package.json')
  .option('-Y, --yarn', 'Install with yarn')
  .usage('<package>[@<version>], default version is \'latest\'')
  .parse(process.argv);

// Print program name and version (like what Yarn does)
console.log(clc.bold(`${name} v${version}`));

// Make sure we're only installing no more than one package
if (program.args.length > 1) {
  console.log(`${errorText} Please specify only one package at a time to install with peerDeps.`);
  process.exit(1);
}

// Make sure we're installing at least one package
if (program.args.length === 0) {
  console.log(`${errorText} Please specify a package to install with peerDeps.`);
  program.help();
  process.exit(1);
}

// The first argument after the options is the name of the package
const packageString = program.args[0];

// Capturing groups are the package name,
// package version with @,
// and bare package version
// eslint-disable-next-line no-useless-escape
const parsed = packageString.match(/^@?([\/\w-]+)(@([\d\.\w]+))?$/);

// Get actual package name, account for @ sign
// (like @angular/core)
let packageName;
if (packageString[0] === '@') {
  packageName = `@${parsed[1]}`;
} else {
  packageName = parsed[1];
}

// Get package version, 2nd capturing group
// includes the @ sign so we get the third
const packageVersion = parsed[3];

// If we can't get a package name out,
// print the format error
if (!packageName) {
  printPackageFormatError();
  process.exit(1);
}

// Default package manager is npm
let packageManager = C.npm;
// If the yarn option was specified, use yarn
if (program.yarn) {
  packageManager = C.yarn;
}

if (program.yarn && program.silent) {
  console.log(`${errorText} Option --silent cannot be used with --yarn.`);
  process.exit(1);
}

// Dev option can't be used with silent,
// since --dev means it should be saved
// as a devDependency
if (program.dev && program.silent) {
  console.log(`${errorText} Option --silent cannot be used with --dev.`);
  process.exit(1);
}

// Define options object to pass to
// the actual install function
const options = {
  packageName,
  version: packageVersion || 'latest',
  dev: program.dev,
  silent: program.silent,
  packageManager,
};

// Disabled this rule so we can hoist the callback
/* eslint-disable no-use-before-define */

// Check if the user has Yarn but didn't specify the Yarn option
// However, don't show prompt if user wants to install silently
if (hasYarn() && packageManager !== C.yarn && !program.silent) {
  // If they do, ask if they want to use Yarn
  confirm(
    'It seems as if you are using Yarn. Would you like to use Yarn for the installation? (y/n)',
    (err, value) => {
      if (err) {
        console.log(`${errorText} ${err.message}`);
        process.exit(1);
      }
      // Value is true or false; if true, they want to use Yarn
      if (value) {
        packageManager = C.yarn;
      }
      // Now install, but with the new packageManager
      installPeerDeps(Object.assign({}, options, {
        packageManager,
      }), installCb);
    },
  );
} else {
  // If they don't have Yarn or they've already
  // opted to use Yarn, go ahead and install
  installPeerDeps(options, installCb);
}

function installCb(err) {
  if (err) {
    console.log(`${errorText} ${err.message}`);
    process.exit(1);
  }
  console.log(`${successText} ${packageName} and its peerDeps were installed successfully.`);
  process.exit(0);
}
/* eslint-enable */
