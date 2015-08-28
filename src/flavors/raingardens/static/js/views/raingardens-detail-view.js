
var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceDetailView = S.PlaceDetailView.extend({
  
    // None of this is changed from the original PlaceDetailView, we just have this here
    // for future use
    render: function() {
      var self = this,
          data = _.extend({
            place_config: this.options.placeConfig,
            survey_config: this.options.surveyConfig
          }, this.model.toJSON());

      data.submitter_name = this.model.get('submitter_name') ||
        this.options.placeConfig.anonymous_name;

      // Augment the template data with the attachments list
      data.attachments = this.model.attachmentCollection.toJSON();

      if (data.rain_garden_number)
        data.rain_garden_number = S.TemplateHelpers.formatNumber (data.rain_garden_number)

      this.$el.html(Handlebars.templates['place-detail'](data));

      // Render the view as-is (collection may have content already)
      this.$('.survey').html(this.surveyView.render().$el);
      // Fetch for submissions and automatically update the element
      this.model.submissionSets[this.surveyType].fetchAllPages();

      this.$('.support').html(this.supportView.render().$el);
      // Fetch for submissions and automatically update the element
      this.model.submissionSets[this.supportType].fetchAllPages();

      return this;
    }
  });
 
}(Shareabouts, jQuery, Shareabouts.Util.console));
