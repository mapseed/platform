require('dotenv').config({path: 'src/.env'});
const fs = require('fs-extra');
const path = require('path');
const walk = require("object-walk");
const exec = require("child_process").exec;
const yaml = require('js-yaml');
const shell = require('shelljs');
const colors = require('colors');

const flavor = process.env.FLAVOR;

// Logging
const logError = (msg) => {
  console.error("(MAKEMESSAGES) ", colors.red("(ERROR!) "), msg);
};

// Generate message catalog for the given flavor's config.yml file.
const flavorBasePath = path.resolve(
  __dirname,
  "src/flavors",
  flavor
);
const messagesCatalogTempPath = path.resolve(
  __dirname,
  "src/flavors",
  flavor,
  "temp-messages"
);
const flavorConfigPath = path.resolve(
  flavorBasePath,
  "config.yml"
);
const config = yaml.safeLoad(fs.readFileSync(flavorConfigPath));
shell.mkdir('-p', messagesCatalogTempPath);

// NOTE: we save these temp files as python files, so we can take advantage of
// Python's multiline string quoting capabilities. The JS equivalent (backticks)
// causes problems for xgettext.
let configMessagesOutput = fs.createWriteStream(
	path.resolve(
		messagesCatalogTempPath,
		"config-messages.temp.py"
	)
);

const configGettextRegex = /^_\(([\s\S]*?)\)$/g;
const escapeQuotes = (message) => {
	return message
		.split('"')
		.join('\\"')
		.split("'")
		.join("\\'");
};

let foundMessage;
walk(config, (val, prop, obj) => {
  if (typeof val === "string") {
  	foundMessage = configGettextRegex.exec(val);
    foundMessage && configMessagesOutput.write('_("""' + escapeQuotes(foundMessage[1]) + '""");\n');
  }
});
configMessagesOutput.end();

const jsTemplatesRegexObj = new RegExp(/{{#_}}([\s\S]*?){{\/_}}/, "g");
let templatePath,
		foundMessages,
		jsTemplatesMessagesOutput,
		extractTemplateMessages = (jsTemplate, outputPath) => {
		  if (jsTemplate.endsWith("html")) {
		    foundMessages = [];

		    // NOTE: we save these temp files as python files, so we can take 
		    // advantage of Python's multiline string quoting capabilities. The JS 
		    // equivalent (backticks) causes problems for xgettext.
		    jsTemplatesMessagesOutput = fs.createWriteStream(
					path.resolve(
						messagesCatalogTempPath,
						jsTemplate + "-messages.temp.py"
					)
				);
		    templateString = fs.readFileSync(
			    path.resolve(outputPath, jsTemplate),
			    "utf8"
			  );
		    while (foundMessage = jsTemplatesRegexObj.exec(templateString)) {

			  	// The second item in foundMessage represents the capture group
			  	foundMessages.push(foundMessage[1]);
			  }

			  foundMessages.forEach((message) => {
			  	jsTemplatesMessagesOutput.write('_("""' + escapeQuotes(message) + '""");\n');
			  });

			  jsTemplatesMessagesOutput.end();
		  }			
		};

// Generate message catalog for flavor-defined jstemplates
const flavorJSTemplatesPath = path.resolve(
  flavorBasePath,
  "jstemplates"
);
fs.readdirSync(flavorJSTemplatesPath).forEach((jsTemplate) => {
	extractTemplateMessages(jsTemplate, flavorJSTemplatesPath);
});

// Generate message catalog for flavor pages
const flavorPagesPath = path.resolve(
  flavorBasePath,
  "jstemplates/pages"
);
fs.readdirSync(flavorPagesPath).forEach((jsTemplate) => {
	extractTemplateMessages(jsTemplate, flavorPagesPath);
});

const flavorLocalePath = path.resolve(
	flavorBasePath,
	"locale"
);
let flavorPOPath,
		mergedFlavorPOPath;
const mergeExistingLocales = () => {
	const locales = fs.readdirSync(flavorLocalePath);
	let finishedLocales = 0;
	locales.forEach((locale) => {
		flavorPOPath = path.resolve(
			flavorLocalePath,
			locale,
			"LC_MESSAGES/messages.po"
		);

		exec(
      "msgmerge" + 
      " --no-location" +
      " --no-fuzzy-matching" +
      " --update " +
      flavorPOPath + " " +
      potFilePath,
      (e) => {
      	if (e) {
      		logError("Error merging po files for " + locale + ":" + e);
					logError("Aborting");

					process.exitCode = 1;
				  process.exit();
      	}
      	finishedLocales++;

      	// If we're all done, remove temporary files.
      	if (finishedLocales === locales.length) {
					shell.rm('-rf', messagesCatalogTempPath);
					shell.rm(path.resolve(
						flavorBasePath,
						"messages.pot"
					));
      	}
      }
    );
	});
};

// Generate .pot (po template) file
const potFilePath = path.resolve(
	flavorBasePath,
	"messages.pot"
);
exec(
  "xgettext" + 
  " --from-code=UTF-8" +
  " -o " + potFilePath + " " +
  messagesCatalogTempPath + "/*",
  (e) => {
  	if (e) {
			logError("Error generating po template file: " + e);
			logError("Aborting");

			process.exitCode = 1;
		  process.exit();
  	}

  	mergeExistingLocales();
  }
);

