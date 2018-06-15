import fs from "fs";
import path from "path";

export default cwd =>
  fs.existsSync(path.resolve(cwd || process.cwd(), "yarn.lock"));
