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
  // Capturing groups are the package name, package version with @,
  // and bare package version.
  // The version number (part after @) can contain digits, letters,
  // dots, or dashes (e.g. bootstrap@4.0.0-beta contains all of those
  // characters)
  // eslint-disable-next-line no-useless-escape
  const parsed = packageString.match(/^@?([\/\w\.-]+)(@([\d\w\.-]+))?$/);

  // Get actual package name, account for @ sign
  // (like @angular/core)
  let packageName;
  if (packageString[0] === "@") {
    packageName = `@${parsed[1]}`;
  } else {
    // eslint-disable-next-line prefer-destructuring
    packageName = parsed[1];
  }

  // Get package version, 2nd capturing group
  // includes the @ sign so we get the third
  const packageVersion = parsed[3];

  return {
    packageName,
    packageVersion
  };
}

// eslint-disable-next-line import/prefer-default-export
export { parsePackageString };
