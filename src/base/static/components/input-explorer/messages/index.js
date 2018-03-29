import messages from "../../../language-module";

const EN_US = require("./en_US.json");
const ES = require("./es.json");

messages.addResourceBundle("en_US", "inputExplorer", EN_US, true, true);
messages.addResourceBundle("es", "inputExplorer", ES, true, true);

export default messages;
