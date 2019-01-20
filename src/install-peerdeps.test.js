import test from "tape";
import { getPackageData, encodePackageName, readPackageFile } from "./install-peerdeps";
import path from "path";

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

test("can read existing package file", t => {

    process.chdir(path.join(__dirname, "..")); // This test depends on current working directory.

    readPackageFile()
        .then(packageFile => {
            t.equal(packageFile.name, "install-peerdeps");
            t.end();
        })
        .catch(err => {
            t.fail(err && err.stack || err);
            t.end();
        });
}); 

test("returns undefined when there is no package file", t => {

    process.chdir(path.join(__dirname, "..", "fixtures", "no-package-file")); // This test depends on current working directory.

    readPackageFile()
        .then(packageFile => {
            t.equal(packageFile, undefined);
            t.end();
        })
        .catch(err => {
            t.fail(err && err.stack || err);
            t.end();
        });
});