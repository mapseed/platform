var PlaceDetailView = require('../../../../../base/static/js/views/place-detail-view.js');
var SubmissionCollection = require('../../../../../base/static/js/models/submission-collection.js');
var Util = require('../../../../../base/static/js/utils.js');
var SurveyView = require('mapseed-survey-view');
var SupportView = require('mapseed-support-view');

module.exports = PlaceDetailView.extend({

  buildFieldListForRender: function() {
    this.fields = Util.buildFieldListForRender({
      // NOTE: flavor-specific addition: additional exlcusions
      exclusions: ["submitter_name", "name", "location_type", "title", "my_image", "venue", "demographics-header", "demographics-description"],
      model: this.model,
      fields: this.categoryConfig.fields,
      commonFormElements: this.commonFormElements,
      isEditingToggled: this.isEditingToggled
    });
  },

  render: function() {
    this.buildFieldListForRender();

    var self = this,
        data = _.extend({
          place_config: this.options.placeConfig,
          survey_config: this.options.surveyConfig,
          url: this.options.url,
          isEditable: this.isEditable || false,
          isEditingToggled: this.isEditingToggled || false,
          isModified: this.isModified,
          fields: this.fields,
          suppressAttachments: this.categoryConfig.suppressAttachments
        }, this.model.toJSON());

    // NOTE: flavor-specific addition: add venue label
    if (data.venue) {
      var venueContent = _.find(this.options.placeConfig.common_form_elements, function(item) {
        return item.name === "venue"
      }).content;
      data.venueLabel = _.find(venueContent, function(item) {
        return item.value === data.venue;
      }).label;        
    }

    this.options.router.on("route", this.tearDown, this);

    data.submitter_name = this.model.get('submitter_name') ||
      this.options.placeConfig.anonymous_name;

    // Augment the template data with the attachments list
    data.attachments = this.model.attachmentCollection.toJSON();

    // Augment the data with any draft changes saved to localstorage
    if (this.isEditingToggled &&
        Util.localstorage.get(this.LOCALSTORAGE_KEY)) {
      
      this.isModified = true;
      data.isModified = true;
      _.extend(data, Util.localstorage.get(this.LOCALSTORAGE_KEY));
    }  

    this.$el.html(Handlebars.templates['place-detail'](data));

    // Render the view as-is (collection may have content already)
    this.$('.survey').html(this.surveyView.render().$el);

    this.$('.support').html(this.supportView.render().$el);
    // Fetch for submissions and automatically update the element
    this.model.submissionSets[this.supportType].fetchAllPages();

    this.delegateEvents();
    this.surveyView.delegateEvents();

    $("#content article").animate({ scrollTop: 0 }, "fast");
    
    // initialize datetime picker, if relevant
    $('#datetimepicker').datetimepicker({ formatTime: 'g:i a' });

    if (this.isEditingToggled) {
      $("#toggle-editor-btn").addClass("btn-depressed");
      $(".promotion, .place-submission-details, .survey-header, .reply-link, .response-header")
        .addClass("faded");

      // detect changes made to non-Quill form elements
      $(this.WATCH_FIELDS).on("keyup change", function(e) {
        if (e.type === "change") {
          self.onModified();
        } else if ((e.keyCode >= 48 && e.keyCode <= 57) || // 0-9 (also shift symbols)
            (e.keyCode >= 65 && e.keyCode <= 90) || // a-z (also capital letters)
            (e.keyCode === 8) || // backspace key
            (e.keyCode === 46) || // delete key
            (e.keyCode === 32) || // spacebar
            (e.keyCode >= 186 && e.keyCode <= 222)) { // punctuation
          
          self.onModified();
        }
      });

      $(".rich-text-field").each(function() {
        new RichTextEditorView({
          el: $(this).get(0),
          model: self.model,
          placeDetailView: self,
          fieldName: $(this).attr("name"),
          fieldId: $(this).attr("id")
        });
      });
    }

    return this;
  }
});
