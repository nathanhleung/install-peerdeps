import clc from "cli-color";

// Some constants so we get an undefined
// error instead of a silent typo in case
// we mispell one of these
export const npm = "npm";
export const yarn = "yarn";

// Create prefixes for error/success events
export const errorText = clc.red.bold("ERR");
export const successText = clc.green.bold("SUCCESS");
