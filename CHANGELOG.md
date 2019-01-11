# 1.10.2

- Fixed #43 - check to see if `--extra-args` is undefined before appending to cli command

# 1.10.1

- Fixed #31 - use [`semver`](https://docs.npmjs.com/misc/semver) to handle version ranges with spaces

# 1.10.0

- Addressed #41 - allow extra arguments to be passed with `--extra-args` flag

# 1.9.0

- Merge #32 by @nandub - add `--proxy` flag
- Merge #38 by @gwicksted - add `--global` flag

# 1.8.0

- Merged #29 by @ljharb - convert tests to Tape

# 1.7.1

- Allow Node.js 0.10 test failure due to Jest incompatibility
- Inline `has-yarn` for compatibility with earlier Node versions

# 1.7.0

- Fixed #25 - allow version number ranges to be installed
- Fixed #24 - allow extra args to be passed through with `--`

# 1.6.0

- Merged #23 - add option to pass Auth header to install private packages

# 1.5.0

- Fixed #16 - remove trailing slash from registry URI if present
- Addressed #21 - target older Node (v0.10)

# 1.4.1

- Merged #18 - update the argument parsing regular expression to account for periods in the package name

# 1.4.0

- Added `--registry` option to specify custom/private package registry
- Fixed #12 - fix version regular expression to allow dashes in the version name (i.e. packages like `bootstrap@4.0.0-beta` are now installable)
- Fixed #3 - proxy environments are now supported (Node.js native `http.request([options])` does not seem to support proxy environments; migrated to [request/request](https://github.com/request/request))
- Migrated from `babel-preset-latest` to `babel-preset-env` targeting Node.js >4.0.0
- Replace Airbnb formatting rules with `prettier` and `eslint --fix` workflow

# 1.3.0

- Merged pull request #15 from @brucewpaul - add the explicit `--no-save` option when using NPM (NPM v5 defaults to `--save`)
- Updated README with build badges, add CONTRIBUTING.md and ROADMAP.md
- Increased test coverage - added tests for #15 and #10
- Added `--dry-run` option for testing

# 1.2.0

- Merged pull request #10 from @okonet - allow installation of only peers instead of peers and package too

# 1.1.3

- Started changelog
- Merged pull request #4 from @lancefisher - handle ranges of peer dependencies
