import { useEffect, useState, useContext, useRef } from "react";
import { useFonts } from "expo-font";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { firebase } from "@react-native-firebase/functions";
import storage from "@react-native-firebase/storage";
import database from "@react-native-firebase/database";
import { LogLevel, OneSignal } from "react-native-onesignal";
import Constants from "expo-constants";
import BackgroundGeolocation, {
  Subscription,
} from "react-native-background-geolocation";
import * as Location from "expo-location";
import { DeviceMotion } from "expo-sensors";
import Mapbox from "@rnmapbox/maps";

import useAuth from "./app/hooks/useAuth";
import MainTabNavigator from "./app/Navigation/MainTabNavigator";
import AuthNavigation from "./app/Navigation/AuthNavigation";
import { UserContext } from "./app/state/contexts/UserContext";

import * as ApiMetadata from "./app/api/ApiMetadata";
import { NotificationProvider } from "./app/state/contexts/NotificationContext";
import { ProfilePicUpdateProvider } from "./app/state/contexts/ProfilePicUpdateContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ProgressProvider } from "./app/state/contexts/PostingProgressContext";
import UpdateModal from "./app/components/UpdateModal";
import useBranchDeepLink from "./app/hooks/useBranchDeepLink";
import { deleteCache, retrieveData } from "./app/utils/cache";
import ReferralNavigator from "./app/Navigation/ReferralNavigator";
import mixpanel from "./app/utils/MixpanelConfig";
import { ChatProvider } from "./app/state/contexts/ChatContext";
import { enableScreens } from "react-native-screens";
import { notifyStationary } from "./app/api/ApiLocation";
import useUser from "./app/hooks/useUser";
import { useBackgroundLocation } from "./app/hooks/useBackgroundLocation";
import useMotionChange from "./app/hooks/useMotionChange";

Mapbox.setAccessToken(
  "pk.."
);
mixpanel.init();
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);


export default function Main() {


  useEffect(() => {
    const onMotionChange = BackgroundGeolocation.onMotionChange(
      async (event) => {
        console.log("[onMotionChange] Event:", event);

        // Retrieve the last known motion state from cache

        const lastIsMoving = await retrieveData("lastIsMoving");

        // Store the current 'isMoving' state into cache
        storeData("lastIsMoving", event.isMoving);

        if (
          //   !inGeofence.current &&
          // lastIsMoving !== null &&
          lastIsMoving !== event.isMoving &&
          !event.isMoving
        ) {
          console.log("Sending notification for being stationary.");
          let Logger = BackgroundGeolocation.logger;
          BackgroundGeolocation.onLocation((location) => {
            Logger.debug("Sending notification for being stationary.");
          });

          const taskId = await BackgroundGeolocation.startBackgroundTask();
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Started checking where you are`,
                body: "Please wait",
              },
              trigger: null,
            });
            let currentPosition =
              await BackgroundGeolocation.getCurrentPosition({
                timeout: 120,
                persist: true,
                maximumAge: 0,
                desiredAccuracy: 1,
                samples: 10,
              });

            await notifyStationary(
              {
                uid: "myuid",
                displayName: "Name Surname",
                photoURL:
                  "images/image_profilePhoto_o859951",
              },
              currentPosition.coords.latitude,
              currentPosition.coords.longitude
            );
            console.log("Notification sent for being stationary.");

            BackgroundGeolocation.stopBackgroundTask(taskId);
          } catch (error) {
            console.error("Error during motion change handling:", error);
            BackgroundGeolocation.stopBackgroundTask(taskId);
          }
        } else {
          let Logger = BackgroundGeolocation.logger;
          BackgroundGeolocation.onLocation((location) => {
            Logger.debug(
              "At home or duplicated, not sending notification for being stationary"
            );
          });
        }
      }
    );

    const token = {
      accessToken:
        "myaccesstoken",
      expires: -1,
      refreshToken: "myrefreshtoken",
      url: "https://tracker.transistorsoft.com",
    };

    /// 2. ready the plugin.
    BackgroundGeolocation.ready({
      // Geolocation Config
      locationAuthorizationRequest: "Always",
      showsBackgroundLocationIndicator: false,
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 50,
      // Activity Recognition
      stopTimeout: 5,
      // Application config
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      logMaxDays: 1,
      stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: true, // <-- Auto start tracking when device is powered-up.
      // HTTP / SQLite config
      // url: 'http://yourserver.com/locations',
      transistorAuthorizationToken: token,

      batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: true, // <-- [Default: true] Set true to sync each location to server as it arrives.
      // headers: {              // <-- Optional HTTP headers
      //   "X-FOO": "bar"
      // },
      // params: {               // <-- Optional HTTP params
      //   "auth_token": "maybe_your_server_authenticates_via_token_YES?"
      // }
    }).then((state) => {
      BackgroundGeolocation.start();
    });
    return () => {
      onMotionChange.remove();
    };
  }, []);

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const isOTA = useRef(null);
  const [deepLinkParams, setDeepLinkParams] = useState(null);

  enableScreens(false);

  useBranchDeepLink(setDeepLinkParams);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { requiredVersion, changelog, OTA, mandatory } =
          await ApiMetadata.getVersion();

        isOTA.current = OTA;

        if (requiredVersion !== "1.0.6" && mandatory) {
          setUpdateModalVisible(changelog);
        }
      } catch (error) {
        console.error("Error fetching version: ", error);
      }
    };

    fetchData();
  }, []);

  const { user, initializing } = useAuth();
  const { hasCompletedProfile, hasCompletedReferral } = useContext(UserContext);

  useEffect(() => {
    const checkDeepLinkAfterAuth = async () => {
      const params = await retrieveData("deepLinkParams");
      if (params) {
        // Assuming you have a method to handle the deep link params
        // Clear the stored params after handling
        setDeepLinkParams(params);
        deleteCache("deepLinkParams");
      }
    };

    if (user && hasCompletedProfile && hasCompletedReferral) {
      checkDeepLinkAfterAuth();
    }
  }, [user, hasCompletedProfile]);

  const [fontsLoaded] = useFonts({
    "futuraPT-bold": require("./app/assets/fonts/FuturaPTBold.otf"),
    "ProximaNova-regular": require("./app/assets/fonts/ProximaNovaRegular.otf"),
    "ProximaNova-semibold": require("./app/assets/fonts/ProximaNovaSemibold.otf"),
    "ProximaNova-bold": require("./app/assets/fonts/ProximaNovaBold.otf"),
    IcoMoon: require("./app/assets/fonts/icomoon.ttf"),
  });

  if (!fontsLoaded) {
    return null; // or a loading screen
  }
  if (initializing) {
    console.log("initializing");
    return null;
  }

  // auth().signOut();

  return user && hasCompletedProfile && hasCompletedReferral ? (
    <NotificationProvider>
      <ProfilePicUpdateProvider>
        <ProgressProvider>
          <ChatProvider>
            <BottomSheetModalProvider>
              <UpdateModal
                visible={updateModalVisible ? true : false}
                message={"New mandatory update available!"}
                changelog={updateModalVisible}
                OTA={isOTA.current}
              />
              <MainTabNavigator deepLinkParams={deepLinkParams} />
            </BottomSheetModalProvider>
          </ChatProvider>
        </ProgressProvider>
      </ProfilePicUpdateProvider>
    </NotificationProvider>
  ) : user && hasCompletedProfile ? (
    <ReferralNavigator />
  ) : (
    <AuthNavigation deepLinkParams={deepLinkParams} />
  );
}
