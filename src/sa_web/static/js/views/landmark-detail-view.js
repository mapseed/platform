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
            story: this.model.attributes.story,
            title: this.model.attributes.title
          };

      // add the story navigation bar
      this.$el.html(Handlebars.templates['place-detail-story-bar'](data));
      this.$el.append(this.description);
      // Render the view as-is (collection may have content already)
      this.$('.survey').html(this.landmarkSurveyView.render().$el);

      // add the story navigation bar again, at the bottom of the view
      this.$el.append(Handlebars.templates['place-detail-story-bar-tagline'](data));

      this.delegateEvents();

      // if there is a story object for this model, set the zoom level
      if (this.model.attributes.story) this.options.mapView.map.setZoom(this.model.attributes.story.zoom);

      return this;
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
