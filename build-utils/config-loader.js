const Gettext = require("node-gettext");
const gettextParser = require("gettext-parser");
//const walk = require("object-walk");
const Handlebars = require("handlebars");
const fs = require('fs-extra');
const path = require('path');


Handlebars.registerHelper("serialize", function(json) {
  if (!json) return false;
  return JSON.stringify(json);
});

module.exports = function(source) {

	// TODO: attach datasets object

	source = source.substring(17);

	const templateSource = fs.readFileSync(
	  path.resolve(
	  	__dirname,
	    "config-template.hbs"
	  ),
	  "utf8"
	);
	const template = Handlebars.compile(templateSource);
	outputFile = template({
    config: JSON.parse(source),
  });

  outputPath = path.resolve(
    __dirname,
    "../www/dist/config-en_US.js"
  );
  fs.writeFileSync(outputPath, outputFile);

	return source;
}