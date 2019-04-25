import i18next from "i18next";
import { reactI18nextModule } from "react-i18next";
import resourceBundle from "../../locales";

i18next.use(reactI18nextModule).init({
  resources: resourceBundle,
  react: { wait: true },
  interpolation: { escapeValue: false },
  saveMissing: true,
  missingKeyHandler: async (lng, ns, key, fallbackValue) => {
    if (i18next.language === i18next.fallbackLng) {
      // We assume that all calls to i18next's `t` translator method supply a
      // default language fallback, so we never need to cache this value and we
      // can skip calling the translate API.
      return;
    }

    const response = await fetch(
      "https://qnvmys9mc8.execute-api.us-west-2.amazonaws.com/v1",
      {
        method: "POST",
        body: JSON.stringify({
          text: fallbackValue,
          target: i18next.language,
          // TODO: html format
          format: "text",
        }),
      },
    );

    if (response.status < 200 || response.status >= 300) {
      // eslint-disable-next-line no-console
      console.error("Error: Failed to translate content:", response.statusText);
    } else {
      const result = await response.json();
      i18next.addResource(i18next.language, ns, key, result.body);
    }
  },
});

export default i18next;
