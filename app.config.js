const IS_DEV = process.env.APP_VARIANT === "development";

export default {
  jsEngine: "hermes",
  name: IS_DEV ? "myApp DEV" : "myApp",
  scheme: IS_DEV ? "myAppdev" : "myApp",
  slug: "myApp",
  version: "1.0.6",
  orientation: "portrait",
  icon: IS_DEV ? "./app/assets/iconDev.png" : "./app/assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./app/assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    url: "https://u.expo.dev/myapp",
    requestHeaders: {
      "expo-channel-name": "production",
    },
  },
  runtimeVersion: {
    policy: "appVersion",
  },

  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: IS_DEV ? true : false,
    buildNumber: "9",
    bundleIdentifier: IS_DEV ? "com.myApp.dev" : "com.myApp.myApp",
    googleServicesFile: IS_DEV
      ? "./GoogleService-Info-Dev.plist"
      : "./GoogleService-Info.plist",
    infoPlist: {
      UIBackgroundModes: [
        "remote-notification",
        "location",
        "fetch",
        "processing",
      ],
      branch_universal_link_domains: [
        "myAppsocial.app.link",
        "myAppsocial-alternate.app.link",
        "myAppsocial.test-app.link",
        "myAppsocial-alternate.test-app.link",
      ],
      branch_key: {
        live: "key_live_myapp",
        test: "key_test_myapp",
      },
      // location
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "This app requires location in the background",
      NSLocationWhenInUseUsageDescription:
        "This app requires location while in use",
      NSMotionUsageDescription:
        "This app uses motion-detection to determine the motion-activity of the device (walking, vehicle, bicycle, etc)",
      BGTaskSchedulerPermittedIdentifiers: IS_DEV
        ? ["com.myApp.dev.fetch", "com.myApp.dev.customtask"]
        : ["com.myApp.myApp.fetch", "com.myApp.myApp.customtask"],
    },
    associatedDomains: [
      "applinks:myAppsocial.web.app",
      "applinks:myApp.social",
      "applinks:myApp.nyc",
      "applinks:myAppsocial.app.link",
      "applinks:myAppsocial-alternate.app.link",
      "applinks:myAppsocial.test-app.link",
      "applinks:myAppsocial-alternate.test-app.link",
    ],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: IS_DEV
        ? "./app/assets/adaptive-icon-dev.png"
        : "./app/assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    googleServicesFile: IS_DEV
      ? "./google-services-dev.json"
      : "./google-services.json",
    package: IS_DEV ? "com.myApp.dev" : "com.myApp.myApp",
  },
  web: {
    favicon: "./app/assets/favicon.png",
  },
  extra: {
    eas: {
      projectId: "myid",
    },
    oneSignalAppId: IS_DEV
      ? "myappkey"
      : "myappkey",
  },
  owner: "sirusbaladi",
  plugins: [
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
          deploymentTarget: "14.0",
        },
        android: {
          // compileSdkVersion: 34,
          // targetSdkVersion: 34,
          // buildToolsVersion: "34.0.0",
          // kotlinVersikon: "1.4.10",
        },
      },
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    "@react-native-firebase/perf",
    "@react-native-firebase/crashlytics",
    [
      "expo-contacts",
      {
        contactsPermission: "Allow myApp to access your contacts.",
      },
    ],
    [
      "onesignal-expo-plugin",
      {
        mode: IS_DEV ? "development" : "production",
      },
    ],
    [
      "@config-plugins/react-native-branch",
      {
        apiKey: "mykey",
        iosAppDomain: "myAppsocial-alternate.app.link",
      },
    ],

    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to let you share them with your friends.",
      },
    ],
    [
      "react-native-vision-camera",
      {
        cameraPermissionText:
          "myApp needs access to your Camera to let you share pics with your friends.",

        enableMicrophonePermission: true,
        microphonePermissionText:
          "$myApp needs access to your Microphone to let your record videos for your friends.",
      },
    ],
    [
      "expo-media-library",
      {
        photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
        savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
        isAccessMediaLocationEnabled: true,
      },
    ],
    [
      "react-native-background-geolocation",
      {
        license: "YOUR_LICENSE_KEY_HERE",
      },
    ],
    [
      "expo-gradle-ext-vars",
      {
        googlePlayServicesLocationVersion: "21.1.0",
        appCompatVersion: "1.4.2",
      },
    ],
    "react-native-background-fetch",
    [
      "expo-sensors",
      {
        motionPermission: "Expo Allow myApp to access your device motion.",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Expo Allow myApp to use your location.",
      },
    ],
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsVersion: "11.1.0",
        RNMapboxMapsDownloadToken:
          "mykey",
      },
    ],
  ],
};
