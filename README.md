# install-peerdeps [![npm version](https://badge.fury.io/js/install-peerdeps.svg)](https://www.npmjs.com/package/install-peerdeps) [![Dependency Status](https://david-dm.org/nathanhleung/install-peerdeps.svg)](https://david-dm.org/nathanhleung/install-peerdeps)
A command-line interface to install an NPM package and its peer dependencies automatically.

NPM v3 doesn't install peerDeps automatically anymore, and it can be a hassle to install them all — now you can, with `install-peerdeps`. Also works with Yarn.

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

  -h, --help     output usage information
  -V, --version  output the version number
  -d, --dev      Install the package as a devDependency
  -S, --silent   If using npm, don't save in package.json
  -Y, --yarn     Install with yarn
```

## Examples
### `eslint-config-airbnb`
This package requires quite a few peer dependencies. Here's what you'd do to install them all:

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

### `@angular/core`
Angular also requires a few peer dependencies.

`install-peerdeps @angular/core` should do the trick.

What if you want to try a beta version? Run `install-peerdeps @angular/core@next`.

This tool will automatically install the version corresponding to the tag, as well as its peer dependencies:

```
...
Installing peerdeps for @angular/core@4.0.0-beta.1.
yarn add @angular/core rxjs@^5.0.1 zone.js@^0.7.2

yarn add v0.18.1
...
```

## Contributing
Issues and pull requests are welcome.

This package is written in ES6 using the `latest` Babel preset and the Airbnb ESlint config.

Please lint and test your code before submitting!

```
npm run lint
npm test
```

Thanks!

## License
[MIT](https://github.com/nathanhleung/install-peerdeps/blob/master/LICENSE)
