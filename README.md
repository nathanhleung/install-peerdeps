# install-peerdeps

> As seen on the README of [Airbnb's ESLint config](https://www.npmjs.com/package/eslint-config-airbnb)!

> _Disclaimer: Airbnb is not affiliated with, and does not endorse, this CLI tool_

[![Build Status](https://travis-ci.org/nathanhleung/install-peerdeps.png?branch=master)](https://travis-ci.org/nathanhleung/install-peerdeps) [![npm version](https://badge.fury.io/js/install-peerdeps.svg)](https://www.npmjs.com/package/install-peerdeps) [![Dependency Status](https://david-dm.org/nathanhleung/install-peerdeps.svg)](https://david-dm.org/nathanhleung/install-peerdeps) [![devDependency Status](https://david-dm.org/nathanhleung/install-peerdeps/dev-status.svg)](https://david-dm.org/nathanhleung/install-peerdeps?type=dev)

[![https://nodei.co/npm/install-peerdeps.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/install-peerdeps.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/install-peerdeps)


A command-line interface to install an NPM package and its peer dependencies automatically.

Starting with NPM v3.0, peer dependencies are not  automatically installed on `npm install`, and it can be a hassle to install them all manually. The `install-peerdeps` tool makes the process fast and easy.

Also works with Yarn.

## Quick Start
```
# If you're using npm
npm install -g install-peerdeps

# If you're using yarn
yarn global add install-peerdeps

cd my-project-directory

install-peerdeps <package>[@<version>]
```

The specified package along with its peer dependencies will be installed.

## Why
It's true that on Linux you can run something like this to automatically install peerDeps (taken from [AirBnb's eslint config repo](https://github.com/airbnb/javascript)):

```
(
  export PKG=eslint-config-airbnb;
  npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs npm install --save-dev "$PKG@latest"
)
```

However, the above solution is hard to remember, and doesn't work on Windows. This tool aims to solve both of these problems.

## Usage
```
Usage: install-peerdeps <package>[@<version>], default version is 'latest'

Installs the specified package along with correct peerDeps.

Options:

  -V, --version         output the version number
  -d, --dev             Install the package as a devDependency
  -o, --only-peers      Install only peerDependencies of the package
  -S, --silent          If using npm, don't save in package.json
  -Y, --yarn            Install with Yarn
  -r, --registry <uri>  Install from custom registry (defaults to NPM registry)
  --dry-run             Do not install packages, but show the install command that will be run
  -h, --help            output usage information

```

## Examples
### Basic Peer Dependency Installation
`eslint-config-airbnb` requires quite a few peer dependencies. Here's what you'd do to install them all:

`install-peerdeps eslint-config-airbnb --dev`

`install-peerdeps` will automatically detect whether you're using Yarn. If you are, it'll prompt you as to whether you want to use Yarn or npm to install the packages.

```
# If you're using npm
npm install eslint-config-airbnb eslint@^3.9.1 eslint-plugin-jsx-a11y@^2.2.3 eslint-plugin-import@^2.1.0 eslint-plugin
-react@^6.6.0 --save-dev

# If you're using yarn
yarn add eslint-config-airbnb eslint@^3.9.1 eslint-plugin-jsx-a11y@^2.2.3 eslint-plugin-import@^2.1.0 eslint-plugin
-react@^6.6.0 --dev
```

### Installing a Different Version Tag
If you'd like to install a different version of a package than the latest (the default), simply specify the version like so:

`install-peerdeps @angular/core@next`

The tool will automatically install the version corresponding to the tag, as well as its peer dependencies:

```
...
Installing peerdeps for @angular/core@4.0.0-beta.1.
yarn add @angular/core rxjs@^5.0.1 zone.js@^0.7.2

yarn add v0.18.1
...
```

### Installing from a Custom Registry
To install from a custom registry, use the `--registry` option:

`install-peerdeps my-custom-package --registry https://registry.mycompany.com`.

If you're having problems, make sure that you don't have a trailing slash at the end of the registry URI (e.g. make sure you have `https://registry.mycompany.com` and NOT `https://registry.mycompany.com/`).

### Proxies
To use this tool with a proxy, set the `HTTPS_PROXY` environment variable (if you're using a custom registry and it is only accessible over HTTP, though, set the `HTTP_PROXY` environment variable).

Under the hood, this package uses the `request` module to get package information from the registry and it spawns an NPM or Yarn child process for the actual installation.

`request` respects the `HTTP_PROXY` and `HTTPS_PROXY` environment variables, and `spawn` passes environment variables to the child process, so if you have the `PROXY` environment variables correctly set, everything should work. Nonetheless, proxy support is a new addition to this tool (added in v1.4.0), so please leave an issue if you have any problems.

`HTTPS_PROXY=https://proxy.mycompany.com/ install-peerdeps my-company-package`

## Contributing
See [CONTRIBUTING.md](https://github.com/nathanhleung/install-peerdeps/blob/master/CONTRIBUTING.md)

## License
[MIT](https://github.com/nathanhleung/install-peerdeps/blob/master/LICENSE)
