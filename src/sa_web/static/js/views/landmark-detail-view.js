/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LandmarkDetailView = S.PlaceDetailView.extend({
    initialize: function() {
      var self = this;
      this.description = this.options.description;
      this.model = this.options.model;

      this.landmarkSurveyView = new S.LandmarkSurveyView({});
    },

    render: function() {
      var self = this,
          data = {
            description: this.description,
            story: this.model.attributes.story
          };

      // add the story navigation bar
      this.$el.html(Handlebars.templates['place-detail-story-bar'](data));
      this.$el.append(this.description);
      // Render the view as-is (collection may have content already)
      this.$('.survey').html(this.landmarkSurveyView.render().$el);

      this.delegateEvents();

      return this;
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
