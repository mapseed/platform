/*globals jQuery Backbone _ Handlebars Spinner Gatekeeper */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
S.LandmarkSurveyView = S.SurveyView.extend({
  initialize: function() {
  },

  render: function() {
    var self = this,
        layout = S.Util.getPageLayout(),
        responseIdToScrollTo, $responseToScrollTo, data;

    this.$el.html(Handlebars.templates['place-detail-survey']({}));

    // get the element based on the id
    $responseToScrollTo = this.$el.find('[data-response-id="'+ responseIdToScrollTo +'"]');

    if ($responseToScrollTo.length > 0) {
      setTimeout(function() {
        // For desktop, the panel content is scrollable
        if (layout === 'desktop') {
          $('#content article').scrollTo($responseToScrollTo);
        } else {
          // For mobile, it's the window
          $(window).scrollTo($responseToScrollTo);
        }
      }, 700);
    }
    return this;
  }
});
}(Shareabouts, jQuery, Shareabouts.Util.console));
