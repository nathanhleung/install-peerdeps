import test from "tape";
import { getPackageData, encodePackageName } from "./install-peerdeps";

test("gets the package data from the registry correctly", t => {
  // Only one async operation will run
  t.plan(1);
  const encodedPackageName = encodePackageName("eslint-config-airbnb");
  getPackageData({
    encodedPackageName,
    registry: "https://registry.npmjs.com"
  }).then(packageData => {
    t.equal(packageData.name, "eslint-config-airbnb");
    t.end();
  }, t.fail);
});
