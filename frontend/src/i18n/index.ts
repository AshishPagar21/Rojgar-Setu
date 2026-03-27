import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en";
import hi from "./locales/hi";
import mr from "./locales/mr";

const LANGUAGE_KEY = "rojgar_setu_language";

const getDefaultLanguage = () => {
  const saved = localStorage.getItem(LANGUAGE_KEY);

  if (saved === "en" || saved === "hi" || saved === "mr") {
    return saved;
  }

  return "en";
};

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
  },
  lng: getDefaultLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem(LANGUAGE_KEY, language);
});

export default i18n;
