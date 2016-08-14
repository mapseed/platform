  var Util = require('../utils.js');

  var SurveyView = require('mapseed-survey-view');
  var SupportView = require('mapseed-support-view');

  var SubmissionCollection = require('../models/submission-collection.js');

  module.exports = Backbone.View.extend({
    events: {
      'click .place-story-bar .btn-previous-story-nav': 'onClickStoryPrevious',
      'click .place-story-bar .btn-next-story-nav': 'onClickStoryNext',
      'click #toggle-editor-btn': 'onToggleEditMode',
      'click #update-place-model-btn': 'onUpdateModel'
    },
    initialize: function() {
      var self = this;

      // should we display the toggle edit mode button?
      this.isEditable = false;
      // should we display editable fields?
      this.isEditingToggled = false;
      this.surveyType = this.options.surveyConfig.submission_type;
      this.supportType = this.options.supportConfig.submission_type;
      
      this.model.on('change', this.onChange, this);

      // Make sure the submission collections are set
      this.model.submissionSets[this.surveyType] = this.model.submissionSets[this.surveyType] ||
        new SubmissionCollection(null, {
          submissionType: this.surveyType,
          placeModel: this.model
        });

      this.model.submissionSets[this.supportType] = this.model.submissionSets[this.supportType] ||
        new SubmissionCollection(null, {
          submissionType: this.supportType,
          placeModel: this.model
        });

      this.surveyView = new SurveyView({
        collection: this.model.submissionSets[this.surveyType],
        surveyConfig: this.options.surveyConfig,
        userToken: this.options.userToken,
        datasetId: self.options.datasetId
      });

      this.supportView = new SupportView({
        collection: this.model.submissionSets[this.supportType],
        supportConfig: this.options.supportConfig,
        userToken: this.options.userToken,
        datasetId: self.options.datasetId
      });

      this.$el.on('click', '.share-link a', function(evt){

        // HACK! Each action should have its own view and bind its own events.
        var shareTo = this.getAttribute('data-shareto');

        Util.log('USER', 'place', shareTo, self.model.getLoggingDetails());
      });

      // Is this user authenticated (i.e. able to edit place detail views)?
      if (S.bootstrapped.currentUser) {
      var re = /(\/([a-zA-Z0-9_]*)$)/;
        _.each(S.bootstrapped.currentUser.groups, function(group) {
          // get the name of the datasetId from the end of the full url
          // provided in S.bootstrapped.currentUser.groups
          var match = group.dataset.match(re)[2];
          if (match && match === self.options.datasetId && group.name === "administrators") {
            self.isEditable = true;
          }
        });
      }
    },

    onClickStoryPrevious: function() {
      this.options.router.navigate(this.model.attributes.story.previous, {trigger: true});
    },

    onClickStoryNext: function() {
      this.options.router.navigate(this.model.attributes.story.next, {trigger: true});
    },

    onToggleEditMode: function() {
      this.isEditingToggled = !this.isEditingToggled;
      this.render();
    },

    render: function() {
      var self = this,
          data = _.extend({
            place_config: this.options.placeConfig,
            survey_config: this.options.surveyConfig,
            url: this.options.url,
            isEditable: self.isEditable || false,
            isEditingToggled: self.isEditingToggled || false
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

      $("#content article").animate({ scrollTop: 0 }, "fast");

      return this;
    },
    remove: function() {
      // Nothing yet
    },

    onChange: function() {
      this.render();
    },

    onUpdateModel: function() {
      // pull data off form and save model, triggering a PUT request
      var test = $("#update-place-model-form");
      var attrs = S.Util.getAttrs(test);
      this.model.set(attrs);
      this.model.save();
    }
  });
