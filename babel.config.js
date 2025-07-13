module.exports = function (api) {
  api.cache(() => true); // غيرنا هنا من api.cache(true) إلى api.cache(() => true)

  const caller = api.caller((cb) => cb && cb.name);
  const isWeb = caller === "babel-loader"; // طريقة أمنة لتحديد إذا بيبني للويب

  const plugins = [
    [
      "module:react-native-dotenv",
      {
        moduleName: "@env",
        path: ".env",
        allowUndefined: true,
      },
    ],
    [
      "module-resolver",
      {
        root: ["./app"],
        alias: {
          "@": "./app",
        },
      },
    ],
  ];

  if (!isWeb) {
    try {
      plugins.push(require.resolve("react-native-reanimated/plugin"));
    } catch (e) {
      console.warn("⚠️ Reanimated plugin not found. Skipping...");
    }
  }

  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
