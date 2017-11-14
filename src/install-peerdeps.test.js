import { getPackageData, encodePackageName } from "./install-peerdeps";

it("gets the package data from the registry correctly", async () => {
  // Only one async operation will run
  expect.assertions(1);
  const encodedPackageName = encodePackageName("eslint-config-airbnb");
  const packageData = await getPackageData({
    encodedPackageName,
    registry: "https://registry.npmjs.com"
  });
  expect(packageData).toHaveProperty("name", "eslint-config-airbnb");
});
