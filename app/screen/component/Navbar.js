import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import * as Animatable from "react-native-animatable";
import SimpleLineIcon from "react-native-vector-icons/MaterialIcons";
import BackButton from "./BackButton";
const Navbar = ({ label, navigation }) => {

  return (
    <View className="flex flex-row items-center justify-between w-full ">
      <BackButton navigation={navigation}/>

     <Text style={styles.title}>{label}</Text>
     <View></View>
    </View>
  );
};
const styles = StyleSheet.create({

  title: { fontSize: 24, fontWeight: "bold", color: "#C9A038", textAlign: "center",  },

});
export default Navbar;
