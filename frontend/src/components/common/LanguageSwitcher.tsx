import { useTranslation } from "react-i18next";

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex items-center gap-2 text-xs">
      <label htmlFor="language" className="font-medium text-slate-700">
        {t("common.language")}
      </label>
      <select
        id="language"
        className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium outline-none focus:border-brand-600"
        value={i18n.language}
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value);
        }}
      >
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="mr">Marathi</option>
      </select>
    </div>
  );
};
