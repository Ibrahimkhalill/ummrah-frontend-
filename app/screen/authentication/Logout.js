import React from "react";
import { View, Image, Text, Button, StyleSheet, Platform } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useAuth } from "./Auth";

const Logout = (props) => {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      {/* <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}> */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/modalogo.jpg")}
          style={styles.logo}
        />
      </View>
      <DrawerItemList {...props} />
      <View style={styles.logoutButtonContainer}>
        <Button
          title="Logout"
          onPress={() => {
            logout();
            props.navigation.navigate("UserLogin");
          }}
          color="#000"
        />
      </View>
      {/* </DrawerContentScrollView> */}
      <View style={styles.footer}>
        <Image
          source={require("../../assets/company-logo.png")} // Replace with your actual company logo path
          style={styles.footerLogo}
        />
        <Text style={styles.footerText}>Powered by Merinasoft</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  drawerContent: {
    flexGrow: 1,
  },
  logoutButtonContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  logo: {
    width: 130,
    height: 54,
  },
  footer: {
    paddingBottom: 30,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  footerLogo: {
    width: 50, // Adjust the size as needed
    height: 40, // Adjust the size as needed
    marginBottom: 5,
  },
  footerText: {
    fontSize: 12,
    color: "#888",
  },
});

export default Logout;
