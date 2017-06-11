/*global Handlebars _ moment */

var Shareabouts = Shareabouts || {};

(function(NS) {
  Handlebars.registerHelper("rain_garden_title", function(
    gardenNumber,
    gardenName,
  ) {
    var gardenTitle = "";
    if (gardenName) {
      gardenTitle = gardenName;
      if (gardenNumber) gardenTitle += " - Rain Garden " + gardenNumber;
    } else {
      if (gardenNumber) gardenTitle = "Rain Garden " + gardenNumber;
    }
    return gardenTitle;
  });
})(Shareabouts);
