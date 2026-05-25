import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en";
import hi from "./locales/hi";
import mr from "./locales/mr";

const LANGUAGE_KEY = "rojgar_setu_language";
const SUPPORTED_LANGUAGES = ["en", "hi", "mr"] as const;

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

void (async () => {
  try {
    let savedLanguage: string | null = null;
    if (typeof window !== "undefined" && window.localStorage) {
      // Web environment
      savedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
    } else {
      // Native environment
      savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    }
    if (
      savedLanguage &&
      SUPPORTED_LANGUAGES.includes(
        savedLanguage as (typeof SUPPORTED_LANGUAGES)[number],
      )
    ) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch {
    // ignore
  }
})();

i18n.on("languageChanged", (language) => {
  if (typeof window !== "undefined" && window.localStorage) {
    // Web environment
    window.localStorage.setItem(LANGUAGE_KEY, language);
  } else {
    // Native environment
    void AsyncStorage.setItem(LANGUAGE_KEY, language);
  }
});

export default i18n;
export { LANGUAGE_KEY, SUPPORTED_LANGUAGES };
