import test from "tape";
import { getPackageData } from "./install-peerdeps";

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
