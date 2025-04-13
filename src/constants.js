import colors from "picocolors";

// Some constants so we get an undefined
// error instead of a silent typo in case
// we mispell one of these
export const npm = "npm";
export const yarn = "yarn";
export const pnpm = "pnpm";

// Create prefixes for error/success events
export const errorText = colors.red(colors.bold("ERR"));
export const successText = colors.green(colors.bold("SUCCESS"));
