import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const CustomSelector = ({
  label,
  options,
  selectedValue,
  onSelect,
  isOpen,
  onToggle,
}) => {
  const handleSelect = (value) => {
    onSelect(value);
    onToggle(false);
  };

  return (
    <TouchableWithoutFeedback onPress={() => onToggle(false)}>
      <View style={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => onToggle(!isOpen)}
          >
            <Text style={{fontSize: 16}}>{selectedValue || `Select ${label}`}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {isOpen && (
          <Modal
            transparent
            animationType="fade"
            visible={isOpen}
            onRequestClose={() => onToggle(false)}
          >
            <TouchableWithoutFeedback onPress={() => onToggle(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.dropdown}>
                  <ScrollView style={styles.scrollContainer}>
                    <Text
                      className="bg-gray-200"
                      style={styles.option}
                    >{`Select ${label}`}</Text>
                    {options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSelect(option)}
                      >
                        <Text style={styles.option}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    width: 76,
    marginTop: 10,
  },
  dropdownButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdown: {
    width: 250,
    maxHeight: 200, // Adjust as needed
    padding: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    elevation: 5,
  },
  scrollContainer: {
    maxHeight: 150, // Adjust as needed
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default CustomSelector;
