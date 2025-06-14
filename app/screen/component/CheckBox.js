import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const CustomCheckbox = ({
  label,
  value,
  onValueChange,
  fontSize,
  bordercolor,
  width,
  height,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  // Update state if the `value` prop changes
  useEffect(() => {
    setIsChecked(value);
  }, [value]);

  const handlePress = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (onValueChange) {
      onValueChange(newValue); // Notify parent component of the change
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View
        style={[
          styles.checkbox,
          {
            borderColor: bordercolor || "#000000",
            width: width || 24,
            height: height || 24,
          },
        ]}
      >
        {isChecked && (
          <Ionicons name="checkmark" size={18} color={bordercolor || "black"} />
        )}
      </View>
      <Text style={[styles.label, { fontSize: fontSize || 14 }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkbox: {
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#ffff",
  },
  label: {
    color: "#333",
  },
});

export default CustomCheckbox;
