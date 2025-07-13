export default {
  expo: {
    name: "Shar'AI",
    slug: "shariaa-analyzer",
    version: "1.0.0",
    owner: "mostafa_mahmoud77",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mostafa.shariaaanalyzer",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.mostafa.shariaaanalyzer",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
      ],
    },
    web: {
      favicon: "./assets/icon.png",
      bundler: "metro",
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow $(PRODUCT_NAME) to access your camera to scan documents.",
        },
      ],

      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: "Production",
        },
      ],
      "expo-font",
      "expo-secure-store",
    ],
    extra: {
      apiBaseUrl: "https://4135d8246f1e.ngrok-free.app",
      router: {
        origin: false,
      },
      eas: {
        projectId: "164c8d77-90bf-44d9-a544-8d52ce101435",
      },
    },
    scheme: "shariaa-analyzer",
  },
};
