# install-peerdeps [![npm version](https://badge.fury.io/js/install-peerdeps.svg)](https://www.npmjs.com/package/install-peerdeps) [![Dependency Status](https://david-dm.org/nathanhleung/install-peerdeps.svg)](https://david-dm.org/nathanhleung/install-peerdeps)
A command-line interface to install an NPM package and its peer dependencies automatically.

NPM v3 doesn't install peerDeps automatically anymore, and it can be a hassle to install them all — now you can, with `install-peerdeps`! Also works with Yarn.

## Why
It's true that on Linux you can run something like this to automatically install peerDeps:

```
(
  export PKG=eslint-config-airbnb;
  npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs npm install --save-dev "$PKG@latest"
)
```

However, the above solution doesn't work on Windows, so you can use this tool instead.

## Usage
```
Usage: install-peerdeps <package>[@<version], default version is 'latest'

Installs the specified package along with correct peerDeps.

Options:

  -h, --help     output usage information
  -V, --version  output the version number
  -d, --dev      Install the package as a devDependency
```

## Example
`eslint-config-airbnb` requires quite a few peer dependencies. Here's what you'd do to install them all:

`install-peerdeps eslint-config-airbnb@latest --dev`

`install-peerdeps` will automatically detect whether you're using Yarn or NPM and run the appropriate command.

If you have NPM: `npm install eslint-config-airbnb eslint@^3.9.1 eslint-plugin-jsx-a11y@^2.2.3 eslint-plugin-import@^2.1.0 eslint-plugin
-react@^6.6.0 --save-dev`

If you have Yarn: `yarn add eslint-config-airbnb eslint@^3.9.1 eslint-plugin-jsx-a11y@^2.2.3 eslint-plugin-import@^2.1.0 eslint-plugin
-react@^6.6.0 --dev`

`@angular/core` also requires some peer dependencies.

`install-peerdeps @angular/core` should do the trick.

## Todo
* work on cli

## License
[MIT](https://github.com/nathanhleung/install-peerdeps/blob/master/LICENSE)
