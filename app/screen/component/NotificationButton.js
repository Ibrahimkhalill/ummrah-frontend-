import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import {
  Image,
  Text,
  View,
  Platform,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  ScrollView,
  Dimensions,
  ToastAndroid,
} from "react-native";
import SimpleLineIcon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../authentication/Auth";
import axiosInstance from "../component/axiosInstance";
import { useFocusEffect } from "@react-navigation/native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useNotificationService from "./notification/NotificationService";
import sendPushNotification from "./notification/NotificationUI";

function NotificationButton({ navigation }) {
  const { token } = useAuth();
  const [notificationCount, setNotificationsCount] = useState(null);
  const { expoPushToken, notification } = useNotificationService();
  console.log("expoPushToken", expoPushToken);

  useEffect(() => {
    // Set up notification listener
    const notificationListener = Notifications.addNotificationReceivedListener(
      () => {
        console.log("Push notification received");
        fetchAndPlayNewNotifications(); // Call the API when a notification is received
      }
    );

    // Cleanup listener on unmount
    return () => {
      if (notificationListener) {
        Notifications.removeNotificationSubscription(notificationListener);
      }
    };
  }, [expoPushToken]);

  // async function playNotificationSound() {
  //   const soundEnabled = await AsyncStorage.getItem("notificationSound");
  //   // const soundObject = new Audio.Sound();
  //   // try {
  //   //   if (soundEnabled) {
  //   //     await soundObject.loadAsync(require("../../assets/notification.mp3")); // Add your notification sound file
  //   //     await soundObject.playAsync();
  //   //     setTimeout(() => {
  //   //       soundObject.unloadAsync(); // Unload sound after playing
  //   //     }, 1000);
  //   //   }
  //   // } catch (error) {
  //   //   console.error("Error playing sound", error);
  //   // }
  //   if (expoPushToken && soundEnabled) {
  //     sendPushNotification(
  //       expoPushToken,
  //       "Reminder to follow up on the surgery..."
  //     );
  //   } else {
  //     alert("Push token not available yet.");
  //   }
  // }
  useEffect(() => {
    // Listener for when the notification is clicked
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        navigation.navigate("Notification");
      }
    );

    // Cleanup listener on unmount
    return () => subscription.remove();
  }, [navigation]);

  async function fetchAndPlayNewNotifications() {
    try {
      const unreadResponse = await axiosInstance.get(
        "/notifications/unread-count/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setNotificationsCount(unreadResponse.data.unread_count);
      const response = await axiosInstance.get("/notifications/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const newNotifications = response.data.filter((n) => !n.is_sound_play);

      // if (newNotifications.length > 0) {

      //   for (const notification of newNotifications) {
      //     await axiosInstance.post(
      //       `/notifications/${notification.id}/sound-played/`,
      //       {}, // Empty body
      //       {
      //         headers: {
      //           Authorization: `Token ${token}`,
      //         },
      //       }
      //     );
      //   }
      // }
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  }

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Notification")}
      style={styles.iconContainer}
    >
      <SimpleLineIcon name="notifications-none" size={25} color="black" />
      {notificationCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{notificationCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  partialBackground: {
    height: 170,
    width: "100%",
    alignSelf: "center",
    borderRadius: 15,
    overflow: "hidden",
  },
  safeArea: {
    flexGrow: 1,
    paddingBottom: 10,
    backgroundColor: "white",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  progressBackground: {
    width: "70%",
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
  },
  iconContainer: {
    position: "relative",
    marginRight: 6,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -3,
    backgroundColor: "red",
    borderRadius: 15,
    width: 15,
    height: 15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FCE488",
    borderRadius: 10,
  },
  percentageText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
    margin: 5,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
  circle: {
    width: 205,
    height: 204,
    borderRadius: 100, // Keeps the outer circle rounded
    backgroundColor: "#ffff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // For absolute positioning of quadrants
  },
  quadrant: {
    position: "absolute",
    width: "49%", // Reduced size to allow 3px gap
    height: "49%", // Reduced size to allow 3px gap
    justifyContent: "center",
    alignItems: "center",
  },
  topLeft: {
    top: 0,
    left: 0,

    backgroundColor: "#FFDC584D",
    borderTopLeftRadius: 100, // Top-left quadrant rounded
  },
  topRight: {
    top: 0,
    right: 0,
    backgroundColor: "#FFDC58",
    borderTopRightRadius: 100,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    backgroundColor: "#FFDC5880",
    borderBottomLeftRadius: 100, // Bottom-left quadrant rounded
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    backgroundColor: "#FFDC58B2",
    borderBottomRightRadius: 100, // Bottom-right quadrant rounded
  },
  text: {
    fontSize: 11,
    color: "black",
    fontWeight: "bold",
  },

  buttonText: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
  },
  gap: {
    position: "absolute",
    top: "25%", // Positioning the gap
    left: "25%", // Positioning the gap
    width: "50%", // Filling the center
    height: "50%", // Filling the center
    borderRadius: 50, // Keeps the gap circular
  },
});

export default NotificationButton;
