/* eslint-disable no-param-reassign, no-shadow, consistent-return */
import "@babel/polyfill";

import fs from "fs";
import { spawn } from "child_process";
import { maxSatisfying } from "semver";
import * as C from "./constants";

/**
 * Encodes the package name for use in a URL/HTTP request
 * @param {string} packageName - the name of the package to encode
 */
function encodePackageName(packageName) {
  // Thanks https://github.com/unpkg/npm-http-server/blob/master/modules/RegistryUtils.js
  // for scoped modules help
  let encodedPackageName;
  if (packageName[0] === "@") {
    // For the registry URL, the @ doesn't get URL encoded for some reason
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`;
  } else {
    encodedPackageName = encodeURIComponent(packageName);
  }
  return encodedPackageName;
}

/**
 * Spawns a command to the shell
 * @param {string} command - the command to spawn
 * @param {array} args - listg of arguments to pass to the command
 * @returns {Promise} - a Promise which resolves when the install process is finished
 */
const spawnCommand = (command, args) => {
  const isWindows = process.platform === "win32";
  let extra = "";
  if (isWindows && !command.endsWith(".cmd")) {
    // Spawn doesn't work without this extra stuff in Windows
    // See https://github.com/nodejs/node/issues/3675
    extra = ".cmd";
  }

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const cmdProcess = spawn(command + extra, args, {
      cwd: process.cwd()
    });
    cmdProcess.stdout.on("data", chunk => {
      stdout += chunk;
    });
    cmdProcess.stderr.on("data", chunk => {
      stderr += chunk;
    });
    cmdProcess.on("error", reject);
    cmdProcess.on("exit", code => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(stderr);
      }
    });
  });
};

/**
 * Parse a registry manifest to get the best matching version
 * @param {Object} requestInfo - information needed to make the request for the data
 * @param {string} requestInfo.data - the data from the remote registry
 * @param {string} requestInfo.version - the version (or version tag) to try to find
 * @returns {string} - The best matching version number
 */
function findPackageVersion({ data, version }) {
  // Get the max satisfying semver version
  const versionToInstall = maxSatisfying(data.versions, version);
  if (versionToInstall) {
    return versionToInstall;
  }

  // When no matching semver, try named tags, like "latest"
  if (data["dist-tags"][version]) {
    return data["dist-tags"][version];
  }

  // No match
  throw new Error("That version or tag does not exist.");
}

/**
 * Gets metadata about the package from the provided registry
 * @param {Object} requestInfo - information needed to make the request for the data
 * @param {string} requestInfo.packageName - the name of the package
 * @param {string} requestInfo.packageManager - the package manager to use (Yarn or npm)
 * @param {string} requestInfo.version - the version (or version tag) to attempt to install
 * @returns {Promise<Object>} - a Promise which resolves to the JSON response from the registry
 */
function getPackageData({ packageName, packageManager, version }) {
  const pkgString = version ? `${packageName}@${version}` : packageName;
  const args = ["info", pkgString, "--json"];
  return spawnCommand(packageManager, args).then(response => {
    const parsed = JSON.parse(response);
    // Yarn returns with an extra nested { data } that NPM doesn't
    return parsed.data || parsed;
  });
}

/**
 * Gets the contents of the package.json for a package at a specific version
 * @param {Object} requestInfo - information needed to make the request for the data
 * @param {string} requestInfo.packageName - the name of the package
 * @param {Boolean} requestInfo.noRegistry - Gets the package dependencies list from the local node_modules instead of remote registry
 * @param {string} requestInfo.packageManager - the package manager to use (Yarn or npm)
 * @param {string} requestInfo.version - the version (or version tag) to attempt to install. Ignored if an installed version of the package is found in node_modules.
 * @returns {Promise<Object>} - a Promise which resolves to the JSON response from the registry
 */
function getPackageJson({ packageName, noRegistry, packageManager, version }) {
  // Local package.json
  if (noRegistry) {
    if (fs.existsSync(`node_modules/${packageName}`)) {
      return Promise.resolve(
        JSON.parse(
          fs.readFileSync(`node_modules/${packageName}/package.json`, "utf8")
        )
      );
    }
  }

  // Remote registry
  return getPackageData({ packageName, packageManager, version })
    .then(data => {
      return Promise.resolve(
        findPackageVersion({
          data,
          version
        })
      );
    })
    .then(version => {
      return getPackageData({
        packageName,
        packageManager,
        version
      });
    });
}

/**
 * Builds the package install string based on the version
 * @param {Object} options - information needed to build a package install string
 * @param {string} options.name - name of the package
 * @param {string} options.version - version string of the package
 * @returns {string} - the package name and version formatted for an install command
 */
const getPackageString = ({ name, version }) => {
  // check for whitespace
  if (version.indexOf(" ") >= 0) {
    // Semver ranges can have a join of comparator sets
    // e.g. '^3.0.2 || ^4.0.0' or '>=1.2.7 <1.3.0'
    // Take the last version in the range
    const rangeSplit = version.split(" ");
    const versionToInstall = rangeSplit[rangeSplit.length - 1];

    if (versionToInstall === null) {
      return name;
    }
    return `${name}@${versionToInstall}`;
  }
  return `${name}@${version}`;
};

/**
 * Installs the peer dependencies of the provided packages
 * @param {Object} options - options for the install child_process
 * @param {string} options.packageName - the name of the package for which to install peer dependencies
 * @param {string} options.version - the version of the package
 * @param {string} options.packageManager - the package manager to use (Yarn or npm)
 * @param {string} options.noRegistry - Disable going to a remote registry to find a list of peers. Use local node_modules instead
 * @param {string} options.dev - whether to install the dependencies as devDependencies
 * @param {boolean} options.onlyPeers - whether to install the package itself or only its peers
 * @param {boolean} options.silent - whether to save the new dependencies to package.json (NPM only)
 * @param {boolean} options.dryRun - whether to actually install the packages or just display
 *                                   the resulting command
 * @param {Function} cb - the callback to call when the install process is finished
 */
function installPeerDeps(
  {
    packageName,
    version,
    packageManager,
    noRegistry,
    dev,
    global,
    onlyPeers,
    silent,
    dryRun,
    extraArgs
  },
  cb
) {
  getPackageJson({ packageName, noRegistry, packageManager, version })
    // Catch before .then because the .then is so long
    .catch(err => cb(err))
    .then(data => {
      // Get peer dependencies for max satisfying version
      const peerDepsVersionMap = data.peerDependencies;
      if (typeof peerDepsVersionMap === "undefined") {
        throw new Error(
          "The package you are trying to install has no peer " +
            "dependencies. Use yarn or npm to install it manually."
        );
      }

      // Construct packages string with correct versions for install
      // If onlyPeers option is true, don't install the package itself,
      // only its peers.
      let packagesString = onlyPeers ? "" : `${packageName}@${data.version}`;

      const packageList = Object.keys(peerDepsVersionMap).map(name =>
        getPackageString({
          name,
          version: peerDepsVersionMap[name]
        })
      );

      if (packageList.length > 0) {
        packagesString = `${packagesString} ${packageList.join(" ")}`;
      }

      // Construct command based on package manager of current project
      let globalFlag = packageManager === C.yarn ? "global" : "--global";
      if (!global) {
        globalFlag = "";
      }
      const subcommand = packageManager === C.yarn ? "add" : "install";
      let devFlag = packageManager === C.yarn ? "--dev" : "--save-dev";
      if (!dev) {
        devFlag = "";
      }

      let args = [];
      // I know I can push it, but I'll just
      // keep concatenating for consistency
      // global must preceed add in yarn; npm doesn't care
      args = args.concat(globalFlag);
      args = args.concat(subcommand);
      // See issue #33 - issue with "-0"
      function fixPackageName(packageName) {
        if (packageName.substr(-2) === "-0") {
          // Remove -0
          return packageName.substr(0, packageName.length - 2);
        }
        return `${packageName}`;
      }
      // If we have spaces in our args spawn()
      // cries foul so we'll split the packagesString
      // into an array of individual packages
      args = args.concat(packagesString.split(" ").map(fixPackageName));
      // If devFlag is empty, then we'd be adding an empty arg
      // That causes the command to fail
      if (devFlag !== "") {
        args = args.concat(devFlag);
      }
      // If we're using NPM, and there's no dev flag,
      // and it's not a silent install and it's not a global install
      // make sure to save deps in package.json under "dependencies"
      if (devFlag === "" && packageManager === C.npm && !silent && !global) {
        args = args.concat("--save");
      }
      // If we are using NPM, and there's no dev flag,
      // and it IS a silent install,
      // explicitly pass the --no-save flag
      // (NPM v5+ defaults to using --save)
      if (
        devFlag === "" &&
        // npm and pnpm are generally interchangeable,
        // but pnpm doesn't have a --save option (see above)
        [C.npm, C.pnpm].includes(packageManager) &&
        silent
      ) {
        args = args.concat("--no-save");
      }

      // Pass extra args through
      if (extraArgs !== "") {
        args = args.concat(extraArgs);
      }

      // Remove empty args
      // There's a bug with Yarn 1.0 in which an empty arg
      // causes the install process to fail with a "malformed
      // response from the registry" error
      args = args.filter(a => a !== "");

      //  Show user the command that's running
      const commandString = `${packageManager} ${args.join(" ")}\n`;
      if (dryRun) {
        console.log(
          `This command would have been run to install ${packageName}@${version}:`
        );
        console.log(commandString);
      } else {
        console.log(`Installing peerdeps for ${packageName}@${version}.`);
        console.log(commandString);
        spawnCommand(packageManager, args)
          .then(() => cb(null))
          .catch(err => cb(err));
      }
    });
}

// Export for testing
export { encodePackageName, getPackageData };

export default installPeerDeps;
