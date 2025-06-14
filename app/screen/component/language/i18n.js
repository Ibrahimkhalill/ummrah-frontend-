import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization"; // Import from expo-localization
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your translation files
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";

// Language resources
const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
};

// Language detector plugin
const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: async (callback) => {
    try {
      const savedLanguage = await AsyncStorage.getItem("appLanguage");
      const deviceLanguage = Localization.locale.split("-")[0]; // Get the device's primary language
      callback(savedLanguage || deviceLanguage || "en");
    } catch (error) {
      console.error("Error detecting language:", error);
      callback("en"); // Fallback to English on error
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem("appLanguage", language);
    } catch (error) {
      console.error("Error caching language:", error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    compatibilityJSON: "v3",
    pluralSeparator: "_", // Ensure pluralization works
    pluralRules: {
      // Define custom plural rules if needed, or let i18next use defaults
    },
    interpolation: {
      escapeValue: false, // Not needed for React Native
    },
    // Ensure i18n is initialized synchronously or handle loading state
    initImmediate: false, // Disable immediate initialization to ensure async detection completes
  })
  .then(() => {
    console.log("i18n initialized successfully with language:", i18n.language);
  })
  .catch((error) => {
    console.error("i18n initialization failed:", error);
  });

export default i18n;