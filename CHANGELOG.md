# 3.0.7

- Fixes #142 - issue when installing packages with a version range that `npm info` returns an array for
- Merges #256 by @JounQin - replace `cli-color` with `picocolors`
- Merges #221 by @gwokae - fix parsing of `--no-registry` option

# 3.0.6

- Fixes NPM install broken by new Yarn code path (`npm npm info` is not a valid `npm` command)

# 3.0.5

- Merges #255 - fix wrong `info` command in Yarn >1, resolving #215, #249, maybe #171, #193, and #228

# 3.0.4

- Merges #254 - update call to `spawn` due to Node.js security, resolving #252

# 3.0.3

- Reverts quotes around package name

# 3.0.2

- Merges #126 - don't coerce version strings to semver, quote package names

# 3.0.1

- Merges #124 - add .cmd suffix to spawned commands on windows

# 3.0.0

- Merges #85 by @developher-net - use package manager to get info, resolving #72 and #73

# 2.0.3

- Merges #88 by @cdierkens - set the default registry to the official registry.npmjs.org, resolving #87

# 2.0.2

- Merges #66 by @marlonicus - fix installation not starting after package manager confirmation, resolving #70

# 2.0.1

- Bumps [commander](https://www.npmjs.com/package/commander) version

# 2.0.0

- Bumps dependencies
- Drops support for Node.js below version 8

# 1.11.0

- Resolves #47 - support pnpm
- Merges #51 by @jaredly - allow installation from linked modules/GitHub, resolving #44
- Merges #50 by @vladimyr - support both `-D` & `-d` flags for dev mode
- Merges #49 by @AndreGeng - make sure registry option is passed through, resolving #48

# 1.10.2

- Fixes #43 - check to see if `--extra-args` is undefined before appending to cli command

# 1.10.1

- Fixes #31 - use [`semver`](https://docs.npmjs.com/misc/semver) to handle version ranges with spaces

# 1.10.0

- Addresses #41 - allow extra arguments to be passed with `--extra-args` flag

# 1.9.0

- Merges #32 by @nandub - add `--proxy` flag
- Merges #38 by @gwicksted - add `--global` flag

# 1.8.0

- Merges #29 by @ljharb - convert tests to Tape to support older Nodes

# 1.7.1

- Allows Node.js 0.10 test failure due to Jest incompatibility
- Inlines `has-yarn` for compatibility with earlier Node versions

# 1.7.0

- Fixes #25 - allow version number ranges to be installed
- Fixes #24 - allow extra args to be passed through with `--`

# 1.6.0

- Merges #23 by @bytheway875 - add option to pass Auth header to install private packages

# 1.5.0

- Fixes #16 - remove trailing slash from registry URI if present
- Addresses #21 - target older Node (v0.10)

# 1.4.1

- Merges #18 by @brucewpaul - update the argument parsing regular expression to account for periods in the package name

# 1.4.0

- Adds `--registry` option to specify custom/private package registry
- Fixes #12 - fix version regular expression to allow dashes in the version name (i.e. packages like `bootstrap@4.0.0-beta` are now installable)
- Fixes #3 - proxy environments are now supported (Node.js native `http.request([options])` does not seem to support proxy environments; migrated to [request/request](https://github.com/request/request))
- Migrates from `babel-preset-latest` to `babel-preset-env` targeting Node.js >4.0.0
- Replaces Airbnb formatting rules with `prettier` and `eslint --fix` workflow

# 1.3.0

- Merges #15 by @brucewpaul - add the explicit `--no-save` option when using NPM (NPM v5 defaults to `--save`)
- Updates README with build badges, add CONTRIBUTING.md and ROADMAP.md
- Increases test coverage - added tests for #15 and #10
- Adds `--dry-run` option for testing

# 1.2.0

- Merges #10 from @okonet - allow installation of only peers instead of peers and package too with new `--only-peers` option

# 1.1.3

- Merges pull request #4 from @lancefisher - fixed semver comparator bug to allow handling of ranges of peer dependencies

# <1.1.3

- No changelog
