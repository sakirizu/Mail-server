module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Removed nativewind/babel plugin to fix PostCSS async error
    ],
  };
};
