# install-peerdeps [![npm version](https://badge.fury.io/js/install-peerdeps.svg)](https://www.npmjs.com/package/install-peerdeps) [![Dependency Status](https://david-dm.org/nathanhleung/install-peerdeps.svg)](https://david-dm.org/nathanhleung/install-peerdeps)
CLI to install package + peerDeps automatically

Since NPM v3 doesn't install peerDeps automatically anymore, it can be a hassle to install them all.

While on Linux you can run something like:

```
(
  export PKG=eslint-config-airbnb;
  npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs npm install --save-dev "$PKG@latest"
)
```

The above solution doesn't work on Windows, so you can use this tool instead.

Also works with Yarn.

## Usage
```

### `eslint-config-airbnb`
Command: `install-peerdeps eslint-config-airbnb@latest`

It'll automatically detect whether you're using Yarn or NPM and run the appropriate command.

If you have NPM: `npm install eslint-config-airbnb eslint@^3.9.1 eslint-plugin-jsx-a11y@^2.2.3 eslint-plugin-import@^2.1.0 eslint-plugin
-react@^6.6.0 --save-dev`

If you have Yarn: `yarn add eslint-config-airbnb eslint@^3.9.1 eslint-plugin-jsx-a11y@^2.2.3 eslint-plugin-import@^2.1.0 eslint-plugin
-react@^6.6.0 --dev`

## Todo
* work on cli

## License
[MIT](https://github.com/nathanhleung/install-peerdeps/blob/master/LICENSE)
