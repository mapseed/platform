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

      if (this.model.attributes.story) {
        // set the zoom level
        // NOTE: setting the zoom level in this way seems to be buggy
        this.options.mapView.map.setZoom(this.model.attributes.story.zoom);
        // set layer visibility based on story config
        _.each(this.model.attributes.story.visibleLayers, function(layer) {
          $(S).trigger('visibility', [layer, true]);
          // TODO: set legend checkboxes appropriately
        });
        // switch off all other layers
        _.each(this.options.mapConfig.layers, function(layer) {
          if (!_.contains(self.model.attributes.story.visibleLayers, layer.id)) {
            // don't turn off basemap layers!
            if (layer.type != "basemap") $(S).trigger('visibility', [layer.id, false]);
            // TODO: set legend checkboxes appropriately
          }
        });
      }

      return this;
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
