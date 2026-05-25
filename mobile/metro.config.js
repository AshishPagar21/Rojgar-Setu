const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure we're using the right entry point
config.projectRoot = __dirname;

// Don't use expo-router
config.resolver.disabledIgnorePatterns = [/node_modules\/expo-router\//];

module.exports = config;
