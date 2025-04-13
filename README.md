# install-peerdeps

> As seen on the README of [Airbnb's ESLint config](https://www.npmjs.com/package/eslint-config-airbnb)!

> _Disclaimer: Airbnb is not affiliated with, and does not endorse, this CLI tool_

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/nathanhleung/install-peerdeps/node.yml) ![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/nathanhleung/install-peerdeps)

[![npm total downloads](https://img.shields.io/npm/dt/install-peerdeps.svg)](https://www.npmjs.com/package/install-peerdeps) [![npm monthly downloads](https://img.shields.io/npm/dm/install-peerdeps.svg)](https://www.npmjs.com/package/install-peerdeps) ![GitHub stars](https://img.shields.io/github/stars/nathanhleung/install-peerdeps?style=social)

[![Node version](https://img.shields.io/node/v/install-peerdeps.svg)](https://github.com/nathanhleung/install-peerdeps) [![npm version](https://badge.fury.io/js/install-peerdeps.svg)](https://www.npmjs.com/package/install-peerdeps)
[![GitHub license](https://img.shields.io/github/license/nathanhleung/install-peerdeps.svg)](https://github.com/nathanhleung/install-peerdeps/blob/master/LICENSE)

💻 Quickly install an npm package and its peer dependencies automatically, using npm, Yarn, or pnpm. 

Starting with npm v3.0, peer dependencies are not automatically installed on `npm install`, and it can be a hassle to install them all manually. The `install-peerdeps` tool makes the process fast and easy.

Also works with [Yarn](https://yarnpkg.com/) (with the `--yarn` flag) and [pnpm](https://pnpm.io/) (with the `--pnpm` flag).

## Quick Start

```
cd my-project-directory

npx install-peerdeps <package>[@<version>]

# If you're using yarn
yarn dlx install-peerdeps --yarn <package>[@<version>]

# If you're using pnpm
pnpm dlx install-peerdeps --pnpm <package>[@<version>]
```

The specified package along with its peer dependencies will be installed.

## Why

It's true that on Linux you can run something like this to automatically install peerDeps (taken from [Airbnb's eslint config repo](https://github.com/airbnb/javascript)):

```
(
  export PKG=eslint-config-airbnb;
  npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs npm install --save-dev "$PKG@latest"
)
```

However, the above solution is hard to remember, and doesn't work on Windows. This tool aims to solve both of these problems.

## Usage

```
Usage: (npx|yarn dlx|pnpm dlx) install-peerdeps <package>[@<version>], default version is 'latest'

Installs the specified package along with correct peerDeps.

Options:
  -V, --version                    output the version number
  -D                               Install the package as a devDependency (alias for `-d`)
  -d, --dev                        Install the package as a devDependency
  -g, --global                     Install the package globally
  -o, --only-peers                 Install only peerDependencies of the package
  -S, --silent                     If using npm, don't save in package.json
  -Y, --yarn                       Install with Yarn
  -P, --pnpm                       Install with pnpm
  -n, --no-registry                Use local node_modules instead of a remote registry to get the list of peerDependencies
  --dry-run                        Do not install packages, but show the install command that will be run
  -x, --extra-args "<extra_args>"  Extra arguments to pass through to the underlying package manager
  -h, --help                       output usage information
```

### Extra Arguments

Only core npm, Yarn, and pnpm arguments relating to package installation are officially provided by `install-peerdeps`. However, if you'd like to pass through additional arguments, you may do so with `--extra-args`. Here's how you'd install a package into a Yarn-workspace-enabled repository:

`install-peerdeps <package> --dev -Y --extra-args "-W"`

Here's how you'd use `--extra-args` to pass a custom npm config option (in this case, disabling `strict-ssl` when accessing a custom registry over HTTPS):

`install-peerdeps <package> --extra-args "--strict-ssl false"`

## Examples

### Basic Peer Dependency Installation

`eslint-config-airbnb` requires quite a few peer dependencies. Here's what you'd do to install them all:

`install-peerdeps eslint-config-airbnb --dev`

`install-peerdeps` will automatically detect whether you're using Yarn. If you are, it'll prompt you as to whether you want to use Yarn or npm to install the packages.

```
# If you're using npm
npm install eslint-config-airbnb@18.2.1 eslint@^7.2.0 eslint-plugin-import@^2.22.1 eslint-plugin-jsx-a11y@^6.4.1 eslint-plugin-react@^7.21.5 eslint-plugin-react-hooks@^1.7.0 --save-dev

# If you're using yarn
yarn add eslint-config-airbnb@18.2.1 eslint@^7.2.0 eslint-plugin-import@^2.22.1 eslint-plugin-jsx-a11y@^6.4.1 eslint-plugin-react@^7.21.5 eslint-plugin-react-hooks@^1.7.0 --dev
```

### Installing a Different Version Tag

If you'd like to install a different version of a package than the latest (the default), simply specify the version like so:

`install-peerdeps @angular/core@next`

The tool will automatically install the version corresponding to the tag, as well as its peer dependencies:

```
Installing peerdeps for @angular/core@next.
yarn add @angular/core@11.2.0-next.0 rxjs@^6.5.3 zone.js@^0.11.3 --dev
```

## Contributing

See [CONTRIBUTING.md](https://github.com/nathanhleung/install-peerdeps/blob/master/CONTRIBUTING.md)

## License

[MIT](https://github.com/nathanhleung/install-peerdeps/blob/master/LICENSE)
