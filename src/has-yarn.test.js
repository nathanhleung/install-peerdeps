import test from "tape";
import path from "path";
import hasYarn from "./has-yarn";

const FIXTURES_DIR = path.join(__dirname, "..", "fixtures", "has-yarn");

test("detects Yarn when a yarn.lock file is present", t => {
  t.equal(hasYarn(path.join(FIXTURES_DIR, "yarn")), true);
  t.equal(hasYarn(path.join(FIXTURES_DIR, "noyarn")), false);
  t.end();
});
