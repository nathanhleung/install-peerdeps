import { parsePackageString } from "./helpers";

it("parses package strings correctly", () => {
  expect.assertions(10);

  const installPeerdeps = parsePackageString("install-peerdeps@1.4.0");
  expect(installPeerdeps.packageName).toBe("install-peerdeps");
  expect(installPeerdeps.packageVersion).toBe("1.4.0");

  const angularCore = parsePackageString("@angular/core@5.0.0-rc.9");
  expect(angularCore.packageName).toBe("@angular/core");
  expect(angularCore.packageVersion).toBe("5.0.0-rc.9");

  const bootstrap = parsePackageString("bootstrap@4.0.0-beta");
  expect(bootstrap.packageName).toBe("bootstrap");
  expect(bootstrap.packageVersion).toBe("4.0.0-beta");

  const koa = parsePackageString("koa@next");
  expect(koa.packageName).toBe("koa");
  expect(koa.packageVersion).toBe("next");

  const enzymeAdapter = parsePackageString("enzyme-adapter-react-15.4@1.0.5");
  expect(enzymeAdapter.packageName).toBe("enzyme-adapter-react-15.4");
  expect(enzymeAdapter.packageVersion).toBe("1.0.5");
});
