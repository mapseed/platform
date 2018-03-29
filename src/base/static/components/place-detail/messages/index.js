import messages from "../../../language-module";

const EN_US = require("./en_US.json");
const ZH_HANT = require("./zh_Hant.json")

messages.addResourceBundle(
  "en_US",
  "placeDetailEditor",
  EN_US.placeDetailEditor,
  true,
  true,
);
messages.addResourceBundle(
  "en_US",
  "placeDetailSurvey",
  EN_US.placeDetailSurvey,
  true,
  true,
);

messages.addResourceBundle(
  "zh_Hant",
  "placeDetailEditor",
  ZH_HANT.placeDetailEditor,
  true,
  true,
);
messages.addResourceBundle(
  "zh_Hant",
  "placeDetailSurvey",
  ZH_HANT.placeDetailSurvey,
  true,
  true,
);

export default messages;
