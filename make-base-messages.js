require('dotenv').config({path: 'src/.env'});
const fs = require('fs-extra');
const path = require('path');
const walk = require("object-walk");
const exec = require("child_process").exec;
const yaml = require('js-yaml');
const shell = require('shelljs');
const colors = require('colors');

// Logging
const logError = (msg) => {
  console.error("(MAKEMESSAGES) ", colors.red("(ERROR!) "), msg);
};

// Generate message catalog for the base project.
const basePath = path.resolve(
  __dirname,
  "src/base"
);
const messagesCatalogTempPath = path.resolve(
  __dirname,
  "temp-messages"
);
shell.mkdir('-p', messagesCatalogTempPath);

const escapeQuotes = (message) => {
	return message
		.split('"')
		.join('\\"')
		.split("'")
		.join("\\'");
};

const jsTemplatesRegexObj = new RegExp(/{{#_}}([\s\S]*?){{\/_}}/, "g");
let templatePath,
		foundMessages,
		jsTemplatesMessagesOutput,
		extractTemplateMessages = (jsTemplate, outputPath) => {
		  if (jsTemplate.endsWith("html") || jsTemplate.endsWith("hbs")) {
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

// Generate message catalog for base project jstemplates
const baseJSTemplatesPath = path.resolve(
  basePath,
  "jstemplates"
);
fs.readdirSync(baseJSTemplatesPath).forEach((jsTemplate) => {
	extractTemplateMessages(jsTemplate, baseJSTemplatesPath);
});

// Generate message catalog for base.hbs
extractTemplateMessages("base.hbs", path.resolve(basePath, "templates"));

const baseLocalePath = path.resolve(
	basePath,
	"locale"
);
let basePOPath,
		mergedBasePOPath;
const mergeExistingLocales = () => {
	const locales = fs.readdirSync(baseLocalePath);
	let finishedLocales = 0;
	locales.forEach((locale) => {
		basePOPath = path.resolve(
			baseLocalePath,
			locale,
			"LC_MESSAGES/messages.po"
		);

		exec(
      "msgmerge" + 
      " --no-location" +
      " --no-fuzzy-matching" +
      " --update " +
      basePOPath + " " +
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
					shell.rm(potFilePath);
      	}
      }
    );
	});
};

// Generate .pot (po template) file
const potFilePath = path.resolve(
	basePath,
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

