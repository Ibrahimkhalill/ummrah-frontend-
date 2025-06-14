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
const HelpModal = ({ isVisible, setIsVisible, navigation }) => {
  const closeHelpModal = () => {
    setIsVisible(false);
  };

  return (
    <View className=" justify-center items-center ">
      {/* HelpModal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={closeHelpModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          {/* Animated HelpModal */}
          <Animatable.View
            animation="zoomIn"
            duration={500} // Animation duration (milliseconds)
            easing="ease-out" // Optional easing
            style={styles.container}
          >
            <Text style={styles.header}>Help!</Text>
            <View style={{ marginTop: 20 }}>
              <Text style={styles.second_text}>
                Our team will contact you within 24 hours
              </Text>
            </View>

            <TouchableOpacity
              onPress={closeHelpModal}
              style={styles.button_second}
            >
              <Text
                style={{ fontSize: 16, textAlign: "center", color: "#000000" }}
              >
                OK
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
    height: 200, // h-[200px]
    padding: 20, // p-5 (padding 5 usually equals 20px)
    borderRadius: 8, // rounded-lg (large border radius)
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 30,
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
    marginTop: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFDC58",
   
  },
});
export default HelpModal;
