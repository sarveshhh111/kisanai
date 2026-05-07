const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ─── Fix: Allow import.meta on web by using the correct transform profile ──────
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// ─── Web-specific resolver: prefer the 'browser' field in package.json ─────────
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: false,
};

module.exports = withNativeWind(config, { input: "./global.css" });
