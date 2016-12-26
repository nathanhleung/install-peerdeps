'use strict';

const npm = require('npm');
const hasYarn = require('has-yarn');
const spawn = require('child_process').spawn;

function installPeerDeps(packageName, version, cb) {
  // If `version` is a function, that means it's the callback
  // Use 'latest' tag as default for version
  if (typeof version === 'function') {
    cb = version;
    version = 'latest';
  }
  // npm.load is required before running any other npm functions
  npm.load((err, npm) => {
    if (err) {
      return cb(err);
    }
    // Access npm registry API
    const registry = npm.registry;
    // JSON data about a package is available at this endpoint
    const packageUri = `https://registry.npmjs.com/${packageName}`;

    registry.get(packageUri, { auth: undefined }, (err, data) => {
      if (err) {
        return cb(err);
      }
      const versions = Object.keys(data.versions);
      // If it's not a valid version, maybe it's a tag
      if (versions.indexOf(version) === -1) {
        const tags = Object.keys(data['dist-tags']);
        //  If it's not a valid tag, throw an error
        if (tags.indexOf(version) === -1) {
          return cb(new Error('That version or tag does not exist.'));
        } else {
          // If the tag is valid, then find the version corresponding to the tag
          version = data['dist-tags'][version];
        }
      }

      // Get peer dependencies for current version
      const peerDepsVersionMap = data.versions[version].peerDependencies;

      // Construct packages string with correct versions for install
      let packagesString = `${packageName}`;
      Object.keys(peerDepsVersionMap).forEach((depName) => {
        packagesString += ` ${depName}@${peerDepsVersionMap[depName]}`;
      });
      // Construct command based on package manager of current project
      const packageManager = hasYarn() ? 'yarn' : 'npm';
      const subcommand = packageManager === 'yarn' ? 'add' : 'install';
      const flag = packageManager === 'yarn' ? '--dev' : '--save-dev';
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
      args = args.concat(flag);

      //  Show user the command that's running
      console.log(`${packageManager} ${subcommand} ${packagesString} ${flag}\n`);
      console.log('Please be patient during the "Linking dependencies" step, it can take a few minutes.')
      // Spawn install process
      const installProcess = spawn(packageManager + extra, args, {
        cwd: process.cwd()
      });
      installProcess.on('error', (err) => {
        return cb(err);
      })
      installProcess.stdout.on('data', (data) => {
        // console.log() prints a newline after everything,
        // so everything ends up being double spaced
        process.stdout.write(data.toString('utf8'));
      });
      installProcess.stderr.on('data', (data) => {
        process.stdout.write(data.toString('utf8'));
      });
      installProcess.on('close', (code) => {
        if (code !== 0) {
          return cb(new Error(`The install process exited with error code ${code}.`));
        }
        return cb(null);
      });
    });
  });
}

export default installPeerDeps;

// test
/*
const packageName = 'eslint-config-airbnb';
installPeerDeps(packageName, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`${packageName} and its correspoding peerDeps were installed successfully.`);
});
*/
