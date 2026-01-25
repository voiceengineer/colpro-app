import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import uz from "./locales/uz.json";

const resources = {
  en: { translation: en },
  uz: { translation: uz },
};

const LANGUAGE_DETECTOR = {
  type: "languageDetector",
  async: true,
  detect: (callback: (lang: string) => void) => {
    AsyncStorage.getItem("user-language", (err, language) => {
      // if error or no language, fallback to device language
      if (err || !language) {
        const locales = getLocales();
        const deviceLanguage = locales[0]?.languageCode ?? "en";
        callback(deviceLanguage === "uz" ? "uz" : "en");
        return;
      }
      callback(language);
    });
  },
  init: () => {},
  cacheUserLanguage: (language: string) => {
    AsyncStorage.setItem("user-language", language);
  },
};

i18n
  .use(initReactI18next)
  .use(LANGUAGE_DETECTOR as any)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    compatibilityJSON: "v3", // Required for Android
    react: {
      useSuspense: false, // Fixes issues on Android
    },
  });

export default i18n;
