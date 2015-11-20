/*globals _ jQuery L Backbone Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.AppView = S.AppView.extend({
    newPlace: function() {
      // Called by the router
      //this.collection.add({});
      //$("#content").$el.html(Handlebars.templates['place-type-form']());
      //$("#content").show();
      var pageHtml = Handlebars.templates['place-type-form']();

      this.$panel.removeClass().addClass('place-form');
      this.showPanel(pageHtml);

      this.hideNewPin();
      this.destroyNewModels();
      this.hideCenterPoint();
      this.setBodyClass('content-visible');
    },
    newPlaceObservation: function() {
      // Called by the router
      this.collection.add({});
      $("#place-location_type").val("observation");
      $("#place-form-type-choice #observation-form-type").addClass("active");
      $("#place-form .select").hide();
    },
    newPlaceQuestion: function() {
      // Called by the router
      this.collection.add({});
      $("#place-location_type").val("question");
      $("#place-form-type-choice #question-form-type").addClass("active");
      $("#place-form .select").hide();
    },
    newPlaceIdea: function() {
      // Called by the router
      this.collection.add({});
      $("#place-location_type").val("idea");
      $("#place-form-type-choice #idea-form-type").addClass("active");
      $("#place-form .select").hide();
    },
    newPlaceComplaint: function() {
      // Called by the router
      this.collection.add({});
      $("#place-location_type").val("complaint");
      $("#place-form-type-choice #complaint-form-type").addClass("active");
      $("#place-form .select").hide();
    },
    newPlaceGreenwall: function() {
      // Called by the router
      this.collection.add({});
      $("#place-location_type").val("greenwall");
    }
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
