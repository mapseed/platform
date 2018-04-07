import i18next from "i18next";
import { reactI18nextModule } from "react-i18next";
import resourceBundle from "../../locales";

i18next.use(reactI18nextModule).init({
  fallbackLng: "en_US",
  resources: resourceBundle,
  react: { wait: true },
  interpolation: { escapeValue: false },
});

export default i18next;
