var Util = require("../utils.js");

var SurveyView = require("mapseed-survey-view");

module.exports = SurveyView.extend({
  initialize: function() {},

  render: function() {
    var self = this,
      layout = Util.getPageLayout(),
      responseIdToScrollTo,
      $responseToScrollTo,
      data;

    this.$el.html(Handlebars.templates["place-detail-survey"]({}));

    // get the element based on the id
    $responseToScrollTo = this.$el.find(
      '[data-response-id="' + responseIdToScrollTo + '"]',
    );

    if ($responseToScrollTo.length > 0) {
      setTimeout(function() {
        // For desktop, the panel content is scrollable
        if (layout === "desktop") {
          $("#content article").scrollTo($responseToScrollTo);
        } else {
          // For mobile, it's the window
          $(window).scrollTo($responseToScrollTo);
        }
      }, 700);
    }
    return this;
  },
});
