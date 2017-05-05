var PlaceDetailView = require('../../../../../base/static/js/views/place-detail-view.js');
var SubmissionCollection = require('../../../../../base/static/js/models/submission-collection.js');
var Utils = require('../../../../../base/static/js/utils.js');
var SurveyView = require('mapseed-survey-view');
var SupportView = require('mapseed-support-view');

module.exports = PlaceDetailView.extend({

  render: function() {

    var self = this,
        data = _.extend({
          place_config: this.options.placeConfig,
          survey_config: this.options.surveyConfig,
          url: this.options.url
        }, this.model.toJSON());

    // add venue label
    if (data.venue) {
      var venueContent = _.find(this.options.placeConfig.common_form_elements, function(item) {
        return item.name === "venue"
      }).content;
      data.venueLabel = _.find(venueContent, function(item) {
        return item.value === data.venue;
      }).label;        
    }

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

    $("#content article").animate({ scrollTop: 0 }, "fast");
    
    return this;
  }
});
