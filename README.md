# install-peerdeps
Installs package + peerDeps automatically

NPM v3 doesn't install peerDeps automatically now, this automates the install of peerDeps. Also works with Yarn.

## Example
### `eslint-config-airbnb`
Command: `install-peerdeps eslint-config-airbnb@latest`

If you have NPM: `yarn install eslint-config-airbnb eslint@^3.9.1 eslint-plugin-jsx-a11y@^2.2.3 eslint-plugin-import@^2.1.0 eslint-plugin
-react@^6.6.0 --save-dev`

If you have Yarn: `yarn add eslint-config-airbnb eslint@^3.9.1 eslint-plugin-jsx-a11y@^2.2.3 eslint-plugin-import@^2.1.0 eslint-plugin
-react@^6.6.0 --dev`

## Todo
* work on cli
