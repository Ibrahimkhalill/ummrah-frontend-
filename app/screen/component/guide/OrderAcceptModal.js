import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next"; // Import react-i18next
import MessengerIcon from "../MessengerIcon";

export default function OrderAcceptModal({ visible, setVisible ,onClose, onAccept , data , navigation }) {
  const [countdown, setCountdown] = useState(20);
  const translateY = useState(new Animated.Value(500))[0];
  const { t } = useTranslation(); // Use translation hook
  useEffect(() => {
    if (visible) {
      setCountdown(10);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      Animated.timing(translateY, {
        toValue: 500,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short" }; // Example: "10 Oct"
    const formattedDate = date.toLocaleDateString("en-US", options);
  
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = days[date.getDay()]; // Get the weekday name
  
    return `${formattedDate}`; // Example: "10 Oct, Fri"
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
       
        <Animated.View style={[styles.modalContent, { transform: [{ translateY }] }]}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={()=>setVisible(false)}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>

          {/* Meeting Location & Time */}
          <View style={{ flexDirection: "row", gap: 2 }}>
            <FontAwesome name="circle" size={18} color="#2E8B57" />
            <Text style={styles.meetText}>{t("meet")}</Text>
          </View>
          <Text style={styles.locationText}>
            {Array.isArray(data?.services) ? 
                                data?.services.map((loc) => loc.location.location_name).join(", ") 
                                : "Unknown Location"}
                            </Text>
          <Text style={styles.timeText}>{formatDate(data?.trip_started_date)} - {formatDate(data?.trip_end_date)}</Text>

          {/* Guide Information */}
          <View style={{flexDirection:"row",  justifyContent:"space-between", width:"100%"}}>
            <View style={styles.profileContainer}>

            <Image
              source={{ uri:data?.user?.image || "https://media.istockphoto.com/id/1391746573/photo/portrait-of-cheerful-saudi-man-visiting-at-turaif-ruins.jpg?s=612x612&w=0&k=20&c=yuHwzjGDwPvqkoqMor5s8EeRvQApduuirQKqgYvLkpE=" }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{t("guideName", { name: data?.user?.name })}</Text>
            </View>
            <MessengerIcon navigation={navigation} screen_name={"Chat"} reciver_id={data?.user?.user?.id} name={data?.user?.name}/>
          </View>

          {/* Payment Info */}
          <View style={styles.paymentContainer}>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentLabel}>{t("payment")}</Text>
              <Text style={styles.paymentAmount}>{t("paymentAmount", { amount: data?.total_amount })} {t("currencySar")}</Text>
            </View>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentLabel}>{t("yourIncome")}</Text>
              <Text style={styles.paymentAmount}>{t("incomeAmount", { amount: data?.total_amount })} {t("currencySar")}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.acceptButton} onPress={()=>onAccept(data?.id)}>
            <Text style={styles.acceptButtonText}>{t("acceptOrder")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={()=>onClose(data?.id)}>
            <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  timerContainer: { position: "absolute", top: "30%", backgroundColor: "rgba(255,255,255,0.2)", padding: 20, borderRadius: 50, alignSelf: "center" },
  timerText: { fontSize: 40, fontWeight: "bold", color: "#fff" },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
  },
  closeButton: { position: "absolute", top: 10, right: 10 },
  meetText: { fontSize: 14, color: "#666", marginBottom: 5, marginTop: 1 },
  locationText: { fontSize: 18, fontWeight: "bold" },
  timeText: { fontSize: 14, color: "#888", marginBottom: 15 },
  profileContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  profileName: { fontSize: 16, fontWeight: "bold" },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginLeft: 10 },
  ratingText: { fontSize: 14, marginLeft: 5 },
  paymentContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 15 },
  paymentBox: { alignItems: "center", flex: 1 },
  paymentLabel: { fontSize: 14, color: "#888" },
  paymentAmount: { fontSize: 16, fontWeight: "bold" },
  acceptButton: { backgroundColor: "#2E8B57", paddingVertical: 12, borderRadius: 8, width: "100%", alignItems: "center", marginBottom: 10 },
  acceptButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: { backgroundColor: "#ddd", paddingVertical: 12, borderRadius: 8, width: "100%", alignItems: "center" },
  cancelButtonText: { color: "#333", fontSize: 16 },
});