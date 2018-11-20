require("dotenv").config({ path: "src/.env" });
const fs = require("fs-extra");
const path = require("path");
const walk = require("object-walk");
const exec = require("child_process").exec;
const shell = require("shelljs");
const colors = require("colors");
const args = require("optimist").argv;

const help =
  "Usage:\n" +
  "Update all existing flavor locale po files for flavor the flavor set in the FLAVOR environment variable: node make-flavor-messages.js\n" +
  "Add a new flavor locale: node make-flavor-messages.js --set-new-locale=<locale_code>";

if (args.h || args.help) {
  // eslint-disable-next-line no-console
  console.log(help);
  process.exit(0);
}

const flavor = process.env.FLAVOR;

// Logging
const logError = msg => {
  // eslint-disable-next-line no-console
  console.error("(MAKEMESSAGES)", colors.red("(ERROR!)"), msg);
};

// Generate message catalog for the given flavor's config.yml file.
const flavorBasePath = path.resolve(__dirname, "../src/flavors", flavor);
const messagesCatalogTempPath = path.resolve(
  __dirname,
  "../src/flavors",
  flavor,
  "temp-messages",
);
const flavorConfigPath = path.resolve(flavorBasePath, "config.json");
const config = JSON.parse(fs.readFileSync(flavorConfigPath, "utf8"));
shell.mkdir("-p", messagesCatalogTempPath);

const escapeQuotes = message => {
  return message
    .split('"')
    .join('\\"')
    .split("'")
    .join("\\'");
};

const jsTemplatesRegexObj = new RegExp(/{{#_}}([\s\S]*?){{\/_}}/, "g");
let foundMessages, jsTemplatesMessagesOutput;
const extractTemplateMessages = (jsTemplate, outputPath) => {
  foundMessages = [];

  // NOTE: we save these temp files as python files, so we can take
  // advantage of Python's multiline string quoting capabilities. The JS
  // equivalent (backticks) causes problems for xgettext.
  jsTemplatesMessagesOutput = fs.createWriteStream(
    path.resolve(messagesCatalogTempPath, jsTemplate + "-messages.temp.py"),
  );
  const templateString = fs.readFileSync(
    path.resolve(outputPath, jsTemplate),
    "utf8",
  );
  while ((foundMessage = jsTemplatesRegexObj.exec(templateString))) {
    // The second item in foundMessage represents the capture group
    foundMessages.push(foundMessage[1]);
  }

  foundMessages.forEach(message => {
    jsTemplatesMessagesOutput.write(
      '_("""' + escapeQuotes(message) + '""");\n',
    );
  });

  jsTemplatesMessagesOutput.end();
};

const cleanup = () => {
  shell.rm("-rf", messagesCatalogTempPath);
  fs.existsSync(potFilePath) && shell.rm(potFilePath);
};

const flavorLocalePath = path.resolve(flavorBasePath, "locale");
let flavorPOPath;
const mergeExistingLocales = () => {
  const locales = fs.readdirSync(flavorLocalePath).filter(locale => {
    // filter out any hidden system files, like .DS_Store
    return !locale.startsWith(".");
  });
  let numFinishedLocales = 0;
  locales.forEach(locale => {
    flavorPOPath = path.resolve(
      flavorLocalePath,
      locale,
      "LC_MESSAGES/messages.po",
    );

    exec(
      "msgmerge" +
        " --no-location" +
        " --no-fuzzy-matching" +
        " --update " +
        flavorPOPath +
        " " +
        potFilePath,
      e => {
        if (e) {
          logError("Error merging po files for " + locale + ":" + e);
          logError("Aborting");

          process.exit(1);
        }
        numFinishedLocales++;

        // If we're all done, remove temporary files.
        if (numFinishedLocales === locales.length) {
          cleanup();
        }
      },
    );
  });
};

const generateCatalog = (merge, outputPath) => {
  exec(
    "xgettext" +
      " --from-code=UTF-8" +
      " --no-location" +
      " -o " +
      outputPath +
      " " +
      messagesCatalogTempPath +
      "/*",
    err => {
      if (err) {
        logError("Error generating po template file: " + err);
        logError("Aborting");

        process.exit(1);
      }

      merge ? mergeExistingLocales() : cleanup();
    },
  );
};

// Extract translatable messages for the config
let configMessagesOutput = fs.createWriteStream(
  path.resolve(messagesCatalogTempPath, "config-messages.temp.py"),
);
let foundMessage;
walk(config, val => {
  if (typeof val === "string") {
    foundMessage = /^_\(([\s\S]*?)\)$/g.exec(val);
    foundMessage &&
      configMessagesOutput.write(
        '_("""' + escapeQuotes(foundMessage[1]) + '""");\n',
      );
  }
});
configMessagesOutput.end();

// Extract translatable messages for flavor-defined jstemplates
const flavorJSTemplatesPath = path.resolve(flavorBasePath, "jstemplates");
fs.readdirSync(flavorJSTemplatesPath).forEach(jsTemplate => {
  if (jsTemplate.endsWith("html")) {
    extractTemplateMessages(jsTemplate, flavorJSTemplatesPath);
  }
});

// Extract translatable messages for flavor pages
const flavorPagesPath = path.resolve(flavorBasePath, "jstemplates/pages");
fs.readdirSync(flavorPagesPath).forEach(jsTemplate => {
  if (jsTemplate.endsWith("html")) {
    extractTemplateMessages(jsTemplate, flavorPagesPath);
  }
});

// Extract translatable messages for email templates
const emailTemplatesPath = path.resolve(flavorBasePath, "templates");
fs.readdirSync(emailTemplatesPath).forEach(emailTemplate => {
  if (emailTemplate.endsWith("txt")) {
    extractTemplateMessages(emailTemplate, emailTemplatesPath);
  }
});

const potFilePath = path.resolve(flavorBasePath, "messages.pot");
if (args["set-new-locale"]) {
  // Create a new locale
  let locale = args["set-new-locale"],
    localePath = path.resolve(flavorLocalePath, locale, "LC_MESSAGES");
  shell.mkdir("-p", localePath);
  generateCatalog(false, localePath + "/messages.po");
} else {
  // Update existing locales
  generateCatalog(true, potFilePath);
}
