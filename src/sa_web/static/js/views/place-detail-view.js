/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceDetailView = Backbone.View.extend({
    events: {
      'click .place-story-bar .btn-previous-story-nav': 'onClickStoryPrevious',
      'click .place-story-bar .btn-next-story-nav': 'onClickStoryNext'
    },
    initialize: function() {
      var self = this;

      this.surveyType = this.options.surveyConfig.submission_type;
      this.supportType = this.options.supportConfig.submission_type;

      this.model.on('change', this.onChange, this);

      // Make sure the submission collections are set
      this.model.submissionSets[this.surveyType] = this.model.submissionSets[this.surveyType] ||
        new S.SubmissionCollection(null, {
          submissionType: this.surveyType,
          placeModel: this.model
        });

      this.model.submissionSets[this.supportType] = this.model.submissionSets[this.supportType] ||
        new S.SubmissionCollection(null, {
          submissionType: this.supportType,
          placeModel: this.model
        });

      this.surveyView = new S.SurveyView({
        collection: this.model.submissionSets[this.surveyType],
        surveyConfig: this.options.surveyConfig,
        userToken: this.options.userToken,
        datasetId: self.options.datasetId
      });

      this.supportView = new S.SupportView({
        collection: this.model.submissionSets[this.supportType],
        supportConfig: this.options.supportConfig,
        userToken: this.options.userToken,
        datasetId: self.options.datasetId
      });

      this.$el.on('click', '.share-link a', function(evt){

        // HACK! Each action should have its own view and bind its own events.
        var shareTo = this.getAttribute('data-shareto');

        S.Util.log('USER', 'place', shareTo, self.model.getLoggingDetails());
      });
    },

    onClickStoryPrevious: function() {
      this.options.router.navigate(this.model.attributes.story.previous, {trigger: true});
    },

    onClickStoryNext: function() {
      this.options.router.navigate(this.model.attributes.story.next, {trigger: true});
    },

    render: function() {
      var self = this,
          data = _.extend({
            place_config: this.options.placeConfig,
            survey_config: this.options.surveyConfig,
            url: this.options.url
          }, this.model.toJSON());

      data.submitter_name = this.model.get('submitter_name') ||
        this.options.placeConfig.anonymous_name;

      // Augment the template data with the attachments list
      data.attachments = this.model.attachmentCollection.toJSON();

      this.$el.html(Handlebars.templates['place-detail'](data));

      // Render the view as-is (collection may have content already)
      this.$('.survey').html(this.surveyView.render().$el);
      // Fetch for submissions and automatically update the element
      this.model.submissionSets[this.surveyType].fetchAllPages();

      this.$('.support').html(this.supportView.render().$el);
      // Fetch for submissions and automatically update the element
      this.model.submissionSets[this.supportType].fetchAllPages();

      this.delegateEvents();

      if (this.model.attributes.story) {
        // set the zoom level
        // NOTE: setting the zoom level in this way seems to be buggy
        this.options.mapView.map.setZoom(this.model.attributes.story.zoom);
        // set layer visibility based on story config
        _.each(this.model.attributes.story.visibleLayers, function(layer) {
          $(S).trigger('visibility', [layer, true]);
          // set legend checkbox
          $("#map-" + layer).prop("checked", true);
        });
        // switch off all other layers
        _.each(this.options.mapConfig.layers, function(layer) {
          if (!_.contains(self.model.attributes.story.visibleLayers, layer.id)) {
            // don't turn off basemap layers!
            if (layer.type != "basemap") {
              $(S).trigger('visibility', [layer.id, false]);
              // set legend checkbox
              $("#map-" + layer.id).prop("checked", false);
            } 
          }
        });
      }

      return this;
    },

    remove: function() {
      // Nothing yet
    },

    onChange: function() {
      this.render();
    }
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
