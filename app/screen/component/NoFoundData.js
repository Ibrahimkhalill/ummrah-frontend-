import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function NoFoundData() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/no_data.webp")} // Placeholder image
        style={styles.image}
      />
      <Text style={styles.text}>No data available</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffff",
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "#555",
  },
});
