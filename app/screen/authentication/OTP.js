import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import SimpleLineIcon from "react-native-vector-icons/SimpleLineIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../component/axiosInstance";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "./Auth";
import * as Clipboard from "expo-clipboard";
function OTP({ route, navigation }) {
  const { formData } = route.params || {};
  const [otpFields, setOtpFields] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const inputRefs = useRef([]);

  const { login, token } = useAuth();

  useEffect(() => {
    if (timeLeft === 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const notifyMessage = (msg) => {
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravityAndOffset(
        msg,
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
        25,
        160
      );
    } else {
      Alert.alert("Success!", msg);
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axiosInstance.post(`/register/`, {
        email: formData.email,
        userName: formData.userName,
        specialty: formData.specialty,
        residencyDuration: formData.residencyDuration,
        residencyYear: formData.residencyYear,
        password: formData.password,
      });
      if (response.status === 201) {
        login(formData.userName, response.data.token);
        if (token) {
          await AsyncStorage.setItem("notificationSound", true);
          navigation.navigate("UserHome");
        }
      }
    } catch (error) {
      console.log("Error: " + error.message);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpFields.some((field) => field === "")) {
      notifyMessage("Please enter all OTP fields.");
      return;
    }
    if (timeLeft === 0) {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
      setOtpFields(["", "", "", ""]);
      notifyMessage("Otp time is experid. Please resend otp!");
      return;
    }

    const otp = otpFields.join("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(`/verify-otp/`, {
        otp: otp,
        email: formData.email,
      });
      if (response.status === 200) {
        handleSignup();
        notifyMessage("OTP Verified Successfully!");
      } else {
        notifyMessage("Invalid OTP, please try again.");
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      const pastedValues = value.slice(0, otpFields.length).split("");
      const updatedOtpFields = [...otpFields];

      pastedValues.forEach((char, idx) => {
        if (index + idx < otpFields.length) {
          updatedOtpFields[index + idx] = char;
        }
      });

      setOtpFields(updatedOtpFields);

      const lastIndex = index + pastedValues.length - 1;
      if (lastIndex < otpFields.length) {
        inputRefs.current[lastIndex]?.focus();
      }
      return;
    }

    const updatedOtp = [...otpFields];
    updatedOtp[index] = value;
    setOtpFields(updatedOtp);

    if (value && index < otpFields.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    setOtpFields(["", "", "", ""]);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    try {
      const response = await axiosInstance.post(`/send-otp/`, {
        email: formData.email,
      });

      if (response.status === 200) {
        setTimeLeft(120);
        notifyMessage("OTP has been resent.");
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
      setOtpFields(["", "", "", ""]);
    }, [])
  );

  const [lastClipboardContent, setLastClipboardContent] = useState("");

  useEffect(() => {
    const checkClipboard = async () => {
      const clipboardContent = await Clipboard.getStringAsync();
      if (
        clipboardContent !== lastClipboardContent &&
        /^\d{4}$/.test(clipboardContent)
      ) {
        const otpArray = clipboardContent.split("");
        setOtpFields(otpArray);
        setLastClipboardContent(clipboardContent); // নতুন কন্টেন্ট সেভ করুন
        await Clipboard.setStringAsync("");
        const lastInputIndex = inputRefs.current.length - 1;
        inputRefs.current[lastInputIndex]?.focus();
      }
    };
    const interval = setInterval(() => {
      checkClipboard();
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval
  }, [lastClipboardContent]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="py-16 items-center bg-white w-full px-5 h-full">
        <View className="flex flex-row items-center justify-between w-full">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <SimpleLineIcon name="arrow-left" size={18} color="gray" />
          </TouchableOpacity>

          <Image
            className="w-[116px] h-[92px] mx-auto"
            source={require("../../assets/MEDLOGO.png")}
          />
        </View>

        <View className="my-40 rounded-lg w-full flex items-center">
          <View className="py-3">
            <Text className="text-[14px]">OTP has been sent to your Email</Text>
          </View>
          <View className="flex-row items-center justify-center gap-2 mt-2">
            {otpFields.map((field, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                className="px-4 py-1 bg-[#FFDC58B2] rounded-[5px] w-[50px] h-[50px] text-[30px] text-center"
                keyboardType="numeric"
                maxLength={1}
                onChangeText={(value) => handleOtpChange(value, index)}
                value={field}
                onKeyPress={({ nativeEvent }) => {
                  if (
                    nativeEvent.key === "Backspace" &&
                    otpFields[index] === "" &&
                    index > 0
                  ) {
                    const updatedOtp = [...otpFields];
                    updatedOtp[index - 1] = ""; // Clear previous input
                    setOtpFields(updatedOtp);
                    inputRefs.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleVerifyOTP}
            className="w-[152px] h-[52px] bg-yellow-400 mt-5 rounded-3xl flex items-center justify-center"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <Text className="text-center text-[#000000] text-[18px]">
                Verify OTP
              </Text>
            )}
          </TouchableOpacity>

          <View className="mt-3 flex-row items-center">
            <Text className="text-[14px] text-gray-600">
              {`${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(
                timeLeft % 60
              ).padStart(2, "0")}`}
            </Text>
            <TouchableOpacity onPress={handleResendOtp} disabled={timeLeft > 0}>
              <Text
                className={`text-[#43506C] ml-1 font-medium ${
                  timeLeft > 0 ? "opacity-50" : ""
                }`}
              >
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default OTP;
