/**
 * @typdef {Object} PackageInfo
 * @property {string} packageName - the name of the package
 * @property {string} packageVersion - the version of the package
 */

/**
 * Parses the given package string into a package name and version
 * @param {string} packageString - a string representing a package name
 *                                 and version (e.g. package@1.0.0)
 * @returns {PackageInfo} - an object containing the package name and package version
 */
function parsePackageString(packageString) {
  // Package scope and package name both can have
  // letters, numbers, dots, hyphens, and underscores.
  // However, they cannot start with dots or underscores
  const packageScopeMatcher = /@[\w\d-]+[\w\d._-]*/;
  const packageNameMatcher = /[\w\d-]+[\w\d._-]*/;
  // The version number may start with a comparator (^, ~, etc) and
  // can contain digits, letters, dots, or dashes (e.g. bootstrap@4.0.0-beta
  // contains all of those characters)
  // Alternatively, it may be a dist tag (e.g. latest, next)
  const packageVersionMatcher = /([\^~v><=]|(>=|<=))?[\d\w.-]+/;
  const packageStringMatcher = new RegExp(
    `((${packageScopeMatcher.source})?/?` +
      `(${packageNameMatcher.source}))(@` +
      `(${packageVersionMatcher.source}))?`
  );
  const parsed = packageString.match(packageStringMatcher);

  // According to regexper, name is the first capturing
  // group and version is the fifth
  const packageName = parsed[1];
  let packageVersion = parsed[5];

  if (packageVersion === "undefined") {
    packageVersion = "latest";
  }

  return {
    packageName,
    packageVersion
  };
}

// eslint-disable-next-line import/prefer-default-export
export { parsePackageString };
