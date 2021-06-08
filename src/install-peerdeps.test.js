import test from "tape";
import { getPackageData, getPackageString } from "./install-peerdeps";

test("gets the package data from the registry correctly", t => {
  // Only one async operation will run
  t.plan(1);
  getPackageData({
    packageName: "eslint-config-airbnb",
    packageManager: "npm"
  }).then(packageData => {
    t.equal(packageData.name, "eslint-config-airbnb");
    t.end();
  }, t.fail);
});

test("gets the latest version from a range of versions", t => {
  t.plan(1);
  const packageString = getPackageString({
    name: "eslint-plugin-react-hooks",
    version: "^4.0.1 || ^3 || ^2.3.0 || ^1.7.0"
  });
  t.equal(packageString, 'eslint-plugin-react-hooks@">=4.0.1 <5.0.0"');
});
