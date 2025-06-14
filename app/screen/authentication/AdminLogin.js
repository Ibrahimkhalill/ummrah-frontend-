import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-vector-icons/Ionicons";
import {
  ToastAndroid,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "./Auth";
import { REACT_APP_BASE_URL } from "@env"; // Import your environment variable
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://194.233.87.22:1001/api", // Use the imported environment variable
});
function AdminLogin({ navigation }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passShow, setPassShow] = useState(false);
  const { login } = useAuth();
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
      Alert.alert("Warning!", msg);
    }
  }

  const handleUserLogin = async () => {
    if (userName === "" && password === "") {
      notifyMessage("Can't leave empty field");

      return;
    }
    if (userName === "") {
      notifyMessage("Can't leave empty field");
      return;
    }
    if (password === "") {
      notifyMessage("Can't leave empty field");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/adminpassword/getAdminPasswordByUsernameAndPassword?username=${userName}&password=${password}`
      );

      if (response.data.length > 0) {
        console.log(response.data);

        login(response.data[0]?.username, "admin");
        navigation.navigate("Admin_Dashboard");
        setIsLoading(false);
      } else {
        console.log("eror");
        notifyMessage("Incorrect username or password");
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      notifyMessage(error);
      setIsLoading(false);
    }
  };
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View
      style={styles.container}
      className="bg-background  flex-1 justify-center items-center"
    >
      <View
        style={styles.loginContainer}
        className=" p-6 pt-5 w-[330px] flex justify-center items-center rounded"
      >
        <Text className="text-2xl font-bold"> Login</Text>
        <View className="w-[300px] mt-3">
          <Text className="text-lg font-bold">User Name</Text>
          <TextInput
            style={styles.input}
            className="mt-2 "
            placeholder="username"
            onChangeText={(onText) => setUserName(onText)}
            value={userName}
          ></TextInput>
          <Text className="mt-6 text-lg font-bold">Password</Text>
          <View className="relative">
            <TextInput
              style={styles.input}
              className="mt-2 "
              placeholder="password"
              onChangeText={(onText) => setPassword(onText)}
              value={password}
              secureTextEntry={!isPasswordVisible}
            ></TextInput>
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.icon}
              className="absolute right-2 top-4"
            >
              <Icon
                name={isPasswordVisible ? "eye" : "eye-off"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => handleUserLogin()} className="mt-6">
            <Text className="bg-cyan-700 p-3 text-center text-white">
            {isLoading ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                " Login"
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    width: "100%",
  },
  input: {
    height: 40,
    width: "100%",
    backgroundColor: "white",
    padding: 10,
    shadowOffset: 2,
  },
  loginContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AdminLogin;
