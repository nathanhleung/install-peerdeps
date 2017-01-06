/* eslint-disable no-param-reassign, no-shadow, consistent-return */

import { request } from 'http';
import { spawn } from 'child_process';
import * as C from './constants';

function getPackageData(encodedPackageName) {
  return new Promise((resolve, reject) => {
    // JSON data about a package is available at https://registry.npmjs.com/<package-name>
    const req = request({
      protocol: 'http:',
      hostname: 'registry.npmjs.com',
      path: `/${encodedPackageName}`,
    }, (res) => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          return resolve(parsedData);
        } catch (err) {
          return reject(err);
        }
      });
    });
    req.on('error', err => reject(err));
    req.end();
  });
}

function spawnInstall(command, args) {
  return new Promise((resolve, reject) => {
    // Spawn install process
    const installProcess = spawn(command, args, {
      cwd: process.cwd(),
      // Something to do with this, progress bar only shows if stdio is inherit
      // https://github.com/yarnpkg/yarn/issues/2200
      stdio: 'inherit',
    });
    installProcess.on('error', err => reject(err));
    installProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`The install process exited with error code ${code}.`));
      }
      return resolve();
    });
  });
}

function installPeerDeps({ packageName, version, packageManager, dev, silent }, cb) {
  // Thanks https://github.com/unpkg/npm-http-server/blob/master/modules/RegistryUtils.js
  // for scoped modules help
  let encodedPackageName;
  if (packageName[0] === '@') {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`;
  } else {
    encodedPackageName = encodeURIComponent(packageName);
  }

  getPackageData(encodedPackageName)
    // Catch before .then because the .then is so long
    .catch(err => cb(err))
    .then((data) => {
      const versions = Object.keys(data.versions);
      // If it's not a valid version, maybe it's a tag
      if (versions.indexOf(version) === -1) {
        const tags = Object.keys(data['dist-tags']);
        //  If it's not a valid tag, throw an error
        if (tags.indexOf(version) === -1) {
          return cb(new Error('That version or tag does not exist.'));
        }
        // If the tag is valid, then find the version corresponding to the tag
        version = data['dist-tags'][version];
      }

      // Get peer dependencies for current version
      const peerDepsVersionMap = data.versions[version].peerDependencies;

      if (typeof peerDepsVersionMap === 'undefined') {
        cb(new Error('The package you are trying to install has no peer dependencies. Use yarn or npm to install it manually.'));
      }

      // Construct packages string with correct versions for install
      let packagesString = `${packageName}`;
      Object.keys(peerDepsVersionMap).forEach((depName) => {
        packagesString += ` ${depName}@${peerDepsVersionMap[depName]}`;
      });
      // Construct command based on package manager of current project
      const subcommand = packageManager === C.yarn ? 'add' : 'install';
      let devFlag = packageManager === C.yarn ? '--dev' : '--save-dev';
      if (!dev) {
        devFlag = '';
      }
      const isWindows = (process.platform === 'win32');
      let extra = '';
      if (isWindows) {
        // Spawn doesn't work without this extra stuff in Windows
        // See https://github.com/nodejs/node/issues/3675
        extra = '.cmd';
      }

      let args = [];
      // I know I can push it, but I'll just
      // keep concatenating for consistency
      args = args.concat(subcommand);
      // If we have spaces in our args spawn()
      // cries foul so we'll split the packagesString
      // into an array of individual packages
      args = args.concat(packagesString.split(' '));
      // If devFlag is empty, then we'd be adding an empty arg
      // That causes the command to fail
      if (devFlag !== '') {
        args = args.concat(devFlag);
      }
      // If we're using NPM, and there's no dev flag,
      // and it's not a silent install make sure to save
      // deps in package.json under "dependencies"
      if (devFlag === '' && packageManager === C.npm && !silent) {
        args = args.concat('--save');
      }

      //  Show user the command that's running
      console.log(`Installing peerdeps for ${packageName}@${version}.`);
      console.log(`${packageManager} ${args.join(' ')}\n`);
      spawnInstall(packageManager + extra, args)
        .then(() => cb(null))
        .catch(err => cb(err));
    });
}

export default installPeerDeps;
