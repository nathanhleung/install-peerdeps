# 1.4.1
* Merged #18 - update the argument parsing regular expression to account for periods in the package name

# 1.4.0
* Added `--registry` option to specify custom/private package registry
* Fixed #12 - fix version regular expression to allow dashes in the version name (i.e. packages like `bootstrap@4.0.0-beta` are now installable)
* Fixed #3 - proxy environments are now supported (Node.js native `http.request([options])` does not seem to support proxy environments; migrated to [request/request](https://github.com/request/request))
* Migrated from `babel-preset-latest` to `babel-preset-env` targeting Node.js >4.0.0
* Replace Airbnb formatting rules with `prettier` and `eslint --fix` workflow

# 1.3.0
* Merged pull request #15 from @brucewpaul - add the explicit `--no-save` option when using NPM (NPM v5 defaults to `--save`)
* Updated README with build badges, add CONTRIBUTING.md and ROADMAP.md
* Increased test coverage - added tests for #15 and #10
* Added `--dry-run` option for testing

# 1.2.0
* Merged pull request #10 from @okonet - allow installation of only peers instead of peers and package too

# 1.1.3
* Started changelog
* Merged pull request #4 from @lancefisher - handle ranges of peer dependencies
