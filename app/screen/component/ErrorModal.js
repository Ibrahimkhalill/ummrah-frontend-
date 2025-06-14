import React, { useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Importing Material Icons

const ErrorModal = ({ message, isVisible, onClose }) => {
  // Close the modal automatically after 2 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      // Cleanup the timeout on unmount or when isVisible changes
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <Modal
      
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Error icon */}
          <MaterialIcons
            name="error-outline"
            size={24}
            color="red"
            style={styles.icon}
          />

          {/* Error message */}
          <Text style={styles.modalMessage}>{message}</Text>

          {/* Close icon */}
          <TouchableOpacity
            onPress={onClose}
            className=" border border-red-500 px-2 py-2 "
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    position: "relative",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  icon: {
    marginBottom: 10,
  },
});

export default ErrorModal;
