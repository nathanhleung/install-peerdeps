import test from "tape";
import { getPackageData } from "./install-peerdeps";

test("gets the package data from the registry correctly", t => {
  // Only one async operation will run
  t.plan(1);
  getPackageData({
    packageName: "eslint-config-airbnb",
    registry: "https://registry.npmjs.com"
  }).then(packageData => {
    t.equal(packageData.name, "eslint-config-airbnb");
    t.end();
  }, t.fail);
});

test("gets the package data from a custom registry correctly", t => {
  // Only one async operation will run
  t.plan(1);
  getPackageData({
    packageName: "@nathanhleung/install-peerdeps-custom-registry-test",
    registry: `https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_PACKAGE_INSTALL_TOKEN}@npm.pkg.github.com`
  }).then(packageData => {
    t.equal(
      packageData.name,
      "@nathanhleung/install-peerdeps-custom-registry-test"
    );
    t.end();
  }, t.fail);
});
