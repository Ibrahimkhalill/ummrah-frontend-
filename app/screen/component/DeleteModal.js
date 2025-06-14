import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import * as Animatable from "react-native-animatable";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../authentication/Auth";
import axiosInstance from "./axiosInstance";
const DeleteModal = ({ isVisible, setIsVisible, navigation }) => {
  const closeDeleteModal = () => {
    setIsVisible(false);
  };

  const { token, logout } = useAuth();

  const handleDelete = async () => {
    try {
      const response = await axiosInstance.delete(
        `/delete_user_and_related_data/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      console.log(response);

      if (response.status === 200) {
        Alert.alert("Success", "Account deleted successfully.");
        logout();
        navigation.navigate("UserLogin");
      }
    } catch (error) {
      console.error("Error deleting surgery:", error);
      Alert.alert("Error", "Could not delete surgery. Please try again later.");
    }
  };
  return (
    <View className=" justify-center items-center ">
      {/* DeleteModal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={closeDeleteModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          {/* Animated DeleteModal */}
          <Animatable.View
            animation="zoomIn"
            duration={500} // Animation duration (milliseconds)
            easing="ease-out" // Optional easing
            style={styles.container}
          >
            <Text style={styles.header}>Delete</Text>
            <View style={{ marginTop: 20 }}>
              <Text style={styles.second_text}>
                Do you want to delete your account ??
              </Text>
              <Text style={styles.second_text}>
                It will permanently delete your al user data.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleDelete}
              style={styles.button_first}
            >
              <Text
                style={{ fontSize: 16, textAlign: "center", color: "#ffff" }}
              >
                DELETE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={closeDeleteModal}
              style={styles.button_second}
            >
              <Text
                style={{ fontSize: 16, textAlign: "center", color: "#00000" }}
              >
                CANCEL
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white", // bg-white
    width: "90%", // w-[90%]
    height: 260, // h-[200px]
    padding: 20, // p-5 (padding 5 usually equals 20px)
    borderRadius: 8, // rounded-lg (large border radius)
  },
  header: {
    fontSize: 20,
    textAlign: "center",
  },
  second_text: {
    fontSize: 14,
    textAlign: "center",
  },
  button_first: {
    backgroundColor: "#FF3B30",
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    borderRadius: 20,
  },
  button_second: {
    backgroundColor: "#ffff",
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFDC58",
  },
});
export default DeleteModal;
