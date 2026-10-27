const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const calendarModules = __CALENDAR_MODULES__;
module.exports = mergeConfig(getDefaultConfig(__dirname), {
  watchFolders: [calendarModules],
  resolver: {
    nodeModulesPaths: [path.join(__dirname, 'node_modules'), calendarModules],
    resolveRequest(context, name, platform) {
      if (name === 'react' || name.startsWith('react/') || name === 'react-native' || name.startsWith('react-native/')) {
        let target;
        try { target = require.resolve(name, {paths: [__dirname]}); }
        catch { target = path.join(__dirname, 'node_modules', name); }
        return context.resolveRequest(context, target, platform);
      }
      return context.resolveRequest(context, name, platform);
    },
  },
});
