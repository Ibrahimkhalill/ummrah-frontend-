import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "react-native-vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { WebView } from "react-native-webview";

import Navbar from "../component/Navbar";
import axiosInstance from "../component/axiosInstance";
import { useAuth } from "../authentication/Auth";

const { height } = Dimensions.get("window"); // Get screen height
const scrollViewHeight = height * 0.8;

const Subscriptions = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const [checkoutUrl, setCheckoutUrl] = useState(null); // Store the checkout URL

  const createCheckoutSession = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/create-checkout-session/", // Your backend endpoint
        {}, // Replace with the actual price ID
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setCheckoutUrl(response.data.checkout_url); // Save the checkout URL
    } catch (error) {
      Alert.alert("Error", "Failed to create checkout session.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = (navState) => {
    if (navState.url.includes("/checkout/success/")) {
      setCheckoutUrl(null); // Close the WebView
      navigation.navigate("UserHome");
      Alert.alert("Success", "Subscription successful!");
    } else if (navState.url.includes("/checkout/cancel/")) {
      setCheckoutUrl(null); // Close the WebView
    }
  };

  if (checkoutUrl) {
    // Render the WebView if a checkout URL is available
    return (
      <SafeAreaView style={styles.safeArea}>
        <WebView
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator size="large" color="#FFDC58" />
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} className="px-5">
      <Navbar navigation_Name={t("user_home")} navigation={navigation} />
      <ScrollView contentContainerStyle={styles.container}>
        <View className="mt-10">
          <View
            className="border border-[#FCE488] flex  py-3"
            style={styles.shadow}
          >
            <View className="flex items-center justify-center my-5">
              <Text className="text-[20px] text-center border-b border-[#FCE488] pb-2 w-[185px]">
                {t("pro_plan")}
              </Text>
            </View>
            <View className="my-5 flex gap-2 items-start pr-5 ">
              <View className="flex flex-row gap-2">
                <Ionicons name="checkbox" size={20} color="#FFDC58" />
                <Text className="text-[16px]">{t("free_trial")}</Text>
              </View>
              <View className="flex flex-row gap-2">
                <Ionicons name="checkbox" size={20} color="#FFDC58" />
                <Text className="text-[16px]">{t("access_all_features")}</Text>
              </View>
              <View className="flex flex-row gap-2">
                <Ionicons name="checkbox" size={20} color="#FFDC58" />
                <Text className="text-[16px]">
                  {t("advanced_progress_monitoring")}
                </Text>
              </View>

              <View className="flex flex-row gap-2">
                <Ionicons name="checkbox" size={20} color="#FFDC58" />
                <Text className="text-[16px]">
                  {t("notification_histology")}
                </Text>
              </View>
              <View className="flex flex-row gap-2">
                <Ionicons name="checkbox" size={20} color="#FFDC58" />
                <Text className="text-[16px]">{t("exportable_reports")}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.sentButton}
              onPress={createCheckoutSession}
              disabled={loading}
            >
              <MaterialIcons name="euro" size={24} color="white" />
              <Text style={styles.sentButtonText}>{t("price")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    height: scrollViewHeight,
  },
  safeArea: {
    flexGrow: 1,
    paddingBottom: 10,
    backgroundColor: "white",
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
  sentButton: {
    width: "98%",
    height: 50,
    backgroundColor: "#FFDC58", // Button color
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    marginLeft: 4,
    flexDirection: "row",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    justifyContent: "space-between",
    paddingLeft: 10,
  },
  optionText: {
    marginLeft: 15,
    fontSize: 17,
    color: "black",
  },
  sentButtonText: {
    fontSize: 18,
    fontWeight: "400",
    color: "white",
    lineHeight: 24,
    marginLeft: 5,
  },
  LebelText: {
    fontSize: 23,
    color: "black",
    lineHeight: 22,
    fontWeight: "700",
  },
  smallText: {
    fontSize: 20,
    color: "black",
    lineHeight: 22,
    marginTop: 15,
  },
});

export default Subscriptions;
