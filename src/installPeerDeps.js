/* eslint-disable no-param-reassign, no-shadow, consistent-return */

import request from "request-promise-native";
import { spawn } from "child_process";
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
 * Gets metadata about the package from the provided registry
 * @param {Object} requestInfo - information needed to make the request for the data
 * @param {string} requestInfo.encodedPackageName - the urlencoded name of the package
 * @param {string} requestInfo.registry - the URI of the registry on which the package is hosted
 * @returns {Promise<Object>} - a Promise which resolves to the JSON response from the registry
 */
function getPackageData({ encodedPackageName, registry }) {
  return request({
    uri: `${registry}/${encodedPackageName}`,
    resolveWithFullResponse: true,
    // When simple is true, all non-200 status codes throw an
    // error. However, we want to handle status code errors in
    // the .then(), so we make simple false.
    simple: false
  }).then(response => {
    const { statusCode } = response;
    if (statusCode === 404) {
      throw new Error(
        "That package doesn't exist. Did you mean to specify a custom registry?"
      );
    }
    // If the statusCode not 200 or 404, assume that something must
    // have gone wrong with the connection
    if (statusCode !== 200) {
      throw new Error("There was a problem connecting to the registry.");
    }
    const { body } = response;
    const parsedData = JSON.parse(body);
    return parsedData;
  });
}

/**
 * Spawns the package manager
 * @param {string} command - the command to spawn
 * @returns {Promise} - a Promise which resolves when the install process is finished
 */
function spawnInstall(command, args) {
  return new Promise((resolve, reject) => {
    // Spawn install process
    const installProcess = spawn(command, args, {
      cwd: process.cwd(),
      // Something to do with this, progress bar only shows if stdio is inherit
      // https://github.com/yarnpkg/yarn/issues/2200
      stdio: "inherit"
    });
    installProcess.on("error", err => reject(err));
    installProcess.on("close", code => {
      if (code !== 0) {
        return reject(
          new Error(`The install process exited with error code ${code}.`)
        );
      }
      return resolve();
    });
  });
}

/**
 * Installs the peer dependencies of the provided packages
 * @param {Object} options - options for the install child_process
 * @param {string} options.packageName - the name of the package for which to install peer dependencies
 * @param {string} options.version - the version of the package
 * @param {string} options.packageManager - the package manager to use (Yarn or npm)
 * @param {string} options.registry - the URI of the registry to install from
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
    registry,
    dev,
    onlyPeers,
    silent,
    dryRun
  },
  cb
) {
  const encodedPackageName = encodePackageName(packageName);
  getPackageData({ encodedPackageName, registry })
    // Catch before .then because the .then is so long
    .catch(err => cb(err))
    .then(data => {
      const versions = Object.keys(data.versions);
      // If it's not a valid version, maybe it's a tag
      if (versions.indexOf(version) === -1) {
        const tags = Object.keys(data["dist-tags"]);
        //  If it's not a valid tag, throw an error
        if (tags.indexOf(version) === -1) {
          return cb(new Error("That version or tag does not exist."));
        }
        // If the tag is valid, then find the version corresponding to the tag
        // eslint-disable-next-line prefer-destructuring
        version = data["dist-tags"][version];
      }

      // Get peer dependencies for current version
      const peerDepsVersionMap = data.versions[version].peerDependencies;

      if (typeof peerDepsVersionMap === "undefined") {
        cb(
          new Error(
            "The package you are trying to install has no peer dependencies. Use yarn or npm to install it manually."
          )
        );
      }

      // Construct packages string with correct versions for install
      // If onlyPeers option is true, don't install the package itself, only its peers.
      let packagesString = onlyPeers ? "" : `${packageName}@${version}`;
      Object.keys(peerDepsVersionMap).forEach(depName => {
        const range = peerDepsVersionMap[depName];
        // Semver ranges can have a join of comparator sets
        // e.g. '^3.0.2 || ^4.0.0' or '>=1.2.7 <1.3.0'
        // We just take the last comparator in the set
        const rangeSplit = range.split(" ");
        const lastComparator = rangeSplit[rangeSplit.length - 1];
        packagesString += ` ${depName}@${lastComparator}`;
      });
      // Construct command based on package manager of current project
      const subcommand = packageManager === C.yarn ? "add" : "install";
      let devFlag = packageManager === C.yarn ? "--dev" : "--save-dev";
      if (!dev) {
        devFlag = "";
      }
      const isWindows = process.platform === "win32";
      let extra = "";
      if (isWindows) {
        // Spawn doesn't work without this extra stuff in Windows
        // See https://github.com/nodejs/node/issues/3675
        extra = ".cmd";
      }

      let args = [];
      // I know I can push it, but I'll just
      // keep concatenating for consistency
      args = args.concat(subcommand);
      // If we have spaces in our args spawn()
      // cries foul so we'll split the packagesString
      // into an array of individual packages
      args = args.concat(packagesString.split(" "));
      // If devFlag is empty, then we'd be adding an empty arg
      // That causes the command to fail
      if (devFlag !== "") {
        args = args.concat(devFlag);
      }
      // If we're using NPM, and there's no dev flag,
      // and it's not a silent install make sure to save
      // deps in package.json under "dependencies"
      if (devFlag === "" && packageManager === C.npm && !silent) {
        args = args.concat("--save");
      }
      // If we are using NPM, and there's no dev flag,
      // and it IS a silent install,
      // explicitly pass the --no-save flag
      // (NPM v5+ defaults to using --save)
      if (devFlag === "" && packageManager === C.npm && silent) {
        args = args.concat("--no-save");
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
          `This command would have been run to install ${packageName}@${
            version
          }:`
        );
        console.log(commandString);
      } else {
        console.log(`Installing peerdeps for ${packageName}@${version}.`);
        console.log(commandString);
        spawnInstall(packageManager + extra, args)
          .then(() => cb(null))
          .catch(err => cb(err));
      }
    });
}

// Export for testing
export { encodePackageName, getPackageData };

export default installPeerDeps;
