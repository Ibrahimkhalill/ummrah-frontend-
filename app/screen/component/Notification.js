import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  ToastAndroid,
  Image,
  Platform,
} from "react-native";
import SimpleLineIcon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../component/axiosInstance"; // Axios instance with token
import { useAuth } from "../authentication/Auth";
import moment from "moment"; // For date formatting and comparison
import { useTranslation } from "react-i18next";
import * as Notifications from "expo-notifications";
import NotificationButton from "./NotificationButton";

function Notification({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const { height } = Dimensions.get("window");
  const scrollViewHeight = height * 0.8; // 90% of the screen height

  const { t } = useTranslation();

  useEffect(() => {
    // Set up notification listener
    const notificationListener = Notifications.addNotificationReceivedListener(
      () => {
        console.log("Push notification received");
        fetchNotifications(); // Call the API when a notification is received
      }
    );

    // Cleanup listener on unmount
    return () => {
      if (notificationListener) {
        Notifications.removeNotificationSubscription(notificationListener);
      }
    };
  }, [token]);

  // Fetch notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/notifications/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      console.log(response.data);

      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      ToastAndroid.show("Failed to load notifications.", ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  };
  function notifyMessage(msg) {
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravityAndOffset(
        msg,
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
        25,
        160
      );
    } else {
      alert(msg);
    }
  }
  // Split notifications into Today and Yesterday
  const categorizeNotifications = () => {
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "day").startOf("day");

    const todayNotifications = [];
    const yesterdayNotifications = [];
    const olderNotifications = {};

    notifications.forEach((notification) => {
      const createdAt = moment(notification.created_at);

      if (createdAt.isSame(today, "day")) {
        // Group notifications for Today
        todayNotifications.push(notification);
      } else if (createdAt.isSame(yesterday, "day")) {
        // Group notifications for Yesterday
        yesterdayNotifications.push(notification);
      } else {
        // Group notifications by their specific date
        const formattedDate = createdAt.format("YYYY-MM-DD"); // e.g., 2024-06-01
        if (!olderNotifications[formattedDate]) {
          olderNotifications[formattedDate] = [];
        }
        olderNotifications[formattedDate].push(notification);
      }
    });

    return { todayNotifications, yesterdayNotifications, olderNotifications };
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.is_read);
      for (const notification of unreadNotifications) {
        await axiosInstance.post(
          `/notifications/${notification.id}/read/`,
          {},
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
      }
      fetchNotifications(); // Refresh notifications
      ToastAndroid.show(
        "All notifications marked as read.",
        ToastAndroid.SHORT
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      ToastAndroid.show(
        "Failed to mark notifications as read.",
        ToastAndroid.SHORT
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      if (!notification.is_read) {
        await axiosInstance.post(
          `/notifications/${notification.id}/read/`,
          {},
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
      }

      // Fetch data related to the notification
      if (notification.data && notification.data.surgery_id) {
        fetchNotifications();
        const response = await axiosInstance.get(
          `/surgery/${notification.data.surgery_id}/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        // Navigate to the Edit page with the fetched data
        navigation.navigate("EidtSurgeries", { data: response.data });
      } else {
        ToastAndroid.show(
          "No related data found for this notification.",
          ToastAndroid.SHORT
        );
      }
    } catch (error) {
      if (error.response) {
        // If the server returned a response (e.g., 400 status)
        const errorMessage = error.response.data.error || "Invalid request"; // Adjust based on your API structure
        console.log("Server error:", error.response);

        // Display the error message in a toast or alert
        notifyMessage(errorMessage); // Replace with your UI feedback mechanism

        // Optionally set it in state to display in the UI
      } else {
        // Handle other types of errors (e.g., network issues)
        console.log("Error without response:", error.message);
      }
    }
  };

  const { todayNotifications, yesterdayNotifications, olderNotifications } =
    categorizeNotifications();

  return (
    <SafeAreaView style={styles.safeArea} className="px-5">
      <View style={styles.headerContainer}>
        <Image
          style={styles.logo}
          source={require("../../assets/MEDLOGO.png")}
        />
        <NotificationButton />
      </View>

      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <SimpleLineIcon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.titleText}>{t("notification")}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        style={{ height: scrollViewHeight }}
      >
        {/* Header */}

        {/* Loading or No Notifications */}
        {isLoading ? (
          <Text style={styles.loadingText}>{t("loading")}</Text>
        ) : notifications.length === 0 ? (
          <Text style={styles.noNotificationsText}>
            {t("no_notifications")}
          </Text>
        ) : (
          <>
            {/* Today */}
            {todayNotifications.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>{t("today")}</Text>
                {todayNotifications.map((notification, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.notificationContainer,
                      notification.is_read && styles.readNotification,
                    ]}
                    onPress={() => handleNotificationClick(notification)}
                  >
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {moment(notification.created_at).format("hh:mm A")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Yesterday */}
            {yesterdayNotifications.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>{t("yesterday")}</Text>
                {yesterdayNotifications.map((notification, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.notificationContainer,
                      notification.is_read && styles.readNotification,
                    ]}
                    onPress={() => handleNotificationClick(notification)}
                  >
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {moment(notification.created_at).format("hh:mm A")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Older Notifications */}
            {Object.keys(olderNotifications).map((date, index) => (
              <View key={index}>
                <Text style={styles.sectionTitle}>
                  {moment(date).format("MMMM D, YYYY")}{" "}
                  {/* e.g., June 1, 2024 */}
                </Text>
                {olderNotifications[date].map((notification, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.notificationContainer,
                      notification.is_read && styles.readNotification,
                    ]}
                    onPress={() => handleNotificationClick(notification)}
                  >
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {moment(notification.created_at).format("hh:mm A")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Mark All as Read */}
        {notifications.some((notification) => !notification.is_read) && (
          <TouchableOpacity style={styles.sentButton} onPress={markAllAsRead}>
            <Text style={styles.sentButtonText}>{t("read_all")}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
    paddingBottom: 10,
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  logo: {
    width: 64,
    height: 54,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  notificationContainer: {
    backgroundColor: "#FFDC58",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  readNotification: {
    backgroundColor: "#E0E0E0",
    color: "#0000000",
  },
  notificationMessage: {
    color: "black",
  },
  notificationFooter: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  notificationTime: {
    color: "black",
    fontSize: 12,
    textAlign: "right",
  },
  sentButton: {
    height: 50,
    backgroundColor: "#FFDC58",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    marginVertical: 20,
  },
  sentButtonText: {
    fontSize: 20,
    fontWeight: "400",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginVertical: 20,
  },
  noNotificationsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginVertical: 20,
  },
});

export default Notification;
