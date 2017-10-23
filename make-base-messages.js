require('dotenv').config({path: 'src/.env'});
const fs = require('fs-extra');
const path = require('path');
const walk = require("object-walk");
const exec = require("child_process").exec;
const yaml = require('js-yaml');
const shell = require('shelljs');
const colors = require('colors');
const args = require("optimist").argv;

const help = "Usage:\n" +
						 "Update all existing base project locale po files: node make-base-messages.js\n" +
						 "Add a new base project locale: node make-base-messages.js --set-new-locale=<locale_code>";

if (args.h || args.help) {
	console.log(help);
	process.exit(0);
}

// Logging
const logError = (msg) => {
 	console.error("(MAKEMESSAGES) ", colors.red("(ERROR!) "), msg);
};

const jsTemplatesRegexObj = new RegExp(/{{#_}}([\s\S]*?){{\/_}}/, "g");

const basePath = path.resolve(
	__dirname,
	"src/base"
);
const baseLocalePath = path.resolve(
	basePath,
	"locale"
);
const potFilePath = path.resolve(
	basePath,
	"messages.pot"
);
const baseJSTemplatesPath = path.resolve(
	basePath,
	"jstemplates"
);
const messagesCatalogTempPath = path.resolve(
	__dirname,
	"temp-messages"
);
shell.mkdir('-p', messagesCatalogTempPath);

let templatePath,
		foundMessages,
		jsTemplatesMessagesOutput;
const extractTemplateMessages = (jsTemplateName, jsTemplatePath) => {
	if (jsTemplate.endsWith("html") || jsTemplate.endsWith("hbs")) {
		foundMessages = [];

		// NOTE: we save these temp files as python files, so we can take 
		// advantage of Python's multiline string quoting capabilities. The JS 
		// equivalent (backticks) causes problems for xgettext.
		jsTemplatesMessagesOutput = fs.createWriteStream(
			path.resolve(
				messagesCatalogTempPath,
				jsTemplateName + "-messages.temp.py"
			)
		);
		templateString = fs.readFileSync(
			path.resolve(jsTemplatePath, jsTemplateName),
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

const cleanup = () => {
	shell.rm('-rf', messagesCatalogTempPath);
	fs.existsSync(potFilePath) && shell.rm(potFilePath);
};

let basePOPath,
		mergedBasePOPath;
const mergeExistingLocales = () => {
	const locales = fs.readdirSync(baseLocalePath)
		.filter((locale) => {

			// filter out any hidden system files, like .DS_Store
			return !locale.startsWith("\.");
		});
	let numFinishedLocales = 0;
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
			(err) => {
				if (err) {
					logError("Error merging po files for " + locale + ": " + err);
					logError("Aborting");

					process.exit(1);
				}
				numFinishedLocales++;

				// If we're all done, remove temporary files.
				if (numFinishedLocales === locales.length) {
					cleanup();
				}
			}
		);
	});
};

const generateCatalog = (merge, outputPath) => {
	exec(
		"xgettext" + 
		" --from-code=UTF-8" +
		" --no-location" +
		" -o " + outputPath + " " +
		messagesCatalogTempPath + "/*",
		(err) => {
			if (err) {
				logError("Error generating po template file: " + err);
				logError("Aborting");

				process.exit(1);
			}

			(merge)
				? mergeExistingLocales()
				: cleanup();
		}
	);	
};

const escapeQuotes = (message) => {
	return message
		.split('"')
		.join('\\"')
		.split("'")
		.join("\\'");
};

// Extract trasnslatable strings from base project jstemplates
fs.readdirSync(baseJSTemplatesPath).forEach((jsTemplateName) => {
	extractTemplateMessages(jsTemplateName, baseJSTemplatesPath);
});

// Extract translatable strings from base.hbs
extractTemplateMessages("base.hbs", path.resolve(basePath, "templates"));

if (args["set-new-locale"]) {

	// Create a new locale
	let locale = args["set-new-locale"],
			localePath = path.resolve(
				baseLocalePath,
				locale,
				"LC_MESSAGES"
			);
	shell.mkdir("-p", localePath);
	generateCatalog(false, localePath + "/messages.po");	
} else {

	// Update existing locales
	generateCatalog(true, potFilePath);
}