import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import * as Animatable from "react-native-animatable";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../authentication/Auth";
import axiosInstance from "./axiosInstance";
import { useTranslation } from "react-i18next";
const DownloadModal = ({
  downloadModal,
  setDownloadModal,
  generatePdf,
  exportDataToExcel,
}) => {
  const { t } = useTranslation();
  if (!downloadModal) {
    return null;
  }

  return (
    <TouchableWithoutFeedback>
      <View
        className=" justify-center items-center absolute top-10 right-0 bg-gray-200 z-50 w-[50vw] px-4 rounded-md "
        style={styles.shadow}
      >
        {/* DownloadModal */}
        <View className="flex items-center justify-center w-full">
          <TouchableOpacity
            className="border-b py-3 w-full"
            onPress={() => {
              generatePdf();
              setDownloadModal(false);
            }}
          >
            <Text className="text-[15px]">{t("export_pdf")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 w-full"
            onPress={() => {
              exportDataToExcel();
              setDownloadModal(false);
            }}
          >
            <Text className="text-[15px]">{t("export_excell")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white", // bg-white
    width: "80%", // w-[90%]
    height: 180, // h-[200px]
    padding: 20, // p-5 (padding 5 usually equals 20px)
    borderRadius: 8, // rounded-lg (large border radius)
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),

    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
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
export default DownloadModal;
