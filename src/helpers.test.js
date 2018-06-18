import test from "tape";
import { parsePackageString } from "./helpers";

test("parses package strings correctly", t => {
  const installPeerdeps = parsePackageString("install-peerdeps@1.4.0");
  t.equal(installPeerdeps.packageName, "install-peerdeps");
  t.equal(installPeerdeps.packageVersion, "1.4.0");

  const angularCore = parsePackageString("@angular/core@5.0.0-rc.9");
  t.equal(angularCore.packageName, "@angular/core");
  t.equal(angularCore.packageVersion, "5.0.0-rc.9");

  const bootstrap = parsePackageString("bootstrap@4.0.0-beta");
  t.equal(bootstrap.packageName, "bootstrap");
  t.equal(bootstrap.packageVersion, "4.0.0-beta");

  const koa = parsePackageString("koa@next");
  t.equal(koa.packageName, "koa");
  t.equal(koa.packageVersion, "next");

  const enzymeAdapter = parsePackageString("enzyme-adapter-react-15.4@1.0.5");
  t.equal(enzymeAdapter.packageName, "enzyme-adapter-react-15.4");
  t.equal(enzymeAdapter.packageVersion, "1.0.5");

  const eslintPluginNode = parsePackageString("eslint-plugin-node@^6.x");
  t.equal(eslintPluginNode.packageName, "eslint-plugin-node");
  t.equal(eslintPluginNode.packageVersion, "^6.x");

  t.end();
});
