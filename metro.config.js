const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    blockList: [
      defaultConfig.resolver.blockList,
      /\/\.cxx\/.*/,
      /\/build\/.*/,
    ],
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs'],
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('@/')) {
        const aliasPath = path.join(__dirname, 'src', moduleName.slice(2));
        return context.resolveRequest(context, aliasPath, platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
