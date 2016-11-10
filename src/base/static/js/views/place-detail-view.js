  var Util = require('../utils.js');

  var SurveyView = require('mapseed-survey-view');
  var SupportView = require('mapseed-support-view');

  var SubmissionCollection = require('../models/submission-collection.js');

  module.exports = Backbone.View.extend({
    events: {
      'click .place-story-bar .btn-previous-story-nav': 'onClickStoryPrevious',
      'click .place-story-bar .btn-next-story-nav': 'onClickStoryNext',
      'click #toggle-editor-btn': 'onToggleEditMode',
      'click #update-place-model-btn': 'onUpdateModel',
      'click #hide-place-model-btn': 'onHideModel',
      'click input[data-input-type="binary_toggle"]': 'onBinaryToggle',
      'change input[type="file"]': 'onInputFileChange',
    },
    initialize: function() {
      var self = this;

      // should we display the toggle edit mode button?
      this.isEditable = false;
      // should we display editable fields?
      this.isEditingToggled = false;
      this.surveyType = this.options.surveyConfig.submission_type;
      this.supportType = this.options.supportConfig.submission_type;
      this.isModified = false;

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
        datasetId: self.options.datasetId,
        placeDetailView: self
      });

      this.supportView = new SupportView({
        collection: this.model.submissionSets[this.supportType],
        supportConfig: this.options.supportConfig,
        userToken: this.options.userToken,
        datasetId: self.options.datasetId
      });

      // fetch comments here instead of in render(), to avoid fetching on
      // a re-render and possibly conflicting with in-progress update/delete calls
      this.model.submissionSets[this.surveyType].fetchAllPages();

      this.$el.on('click', '.share-link a', function(evt){

        // HACK! Each action should have its own view and bind its own events.
        var shareTo = this.getAttribute('data-shareto');

        Util.log('USER', 'place', shareTo, self.model.getLoggingDetails());
      });

      // Is this user authenticated (i.e. able to edit place detail views)?
      if (S.bootstrapped.currentUser && S.bootstrapped.currentUser.groups) {
        _.each(S.bootstrapped.currentUser.groups, function(group) {
          // get the name of the datasetId from the end of the full url
          // provided in S.bootstrapped.currentUser.groups
          var url = group.dataset.split("/"),
          match = url[url.length - 1];
          if (match && match === self.options.datasetId && group.name === "administrators") {
            self.isEditable = true;
          }
        });
      }

      this.model.attachmentCollection.on("add", this.onAddAttachment, this);
    },

    onClickStoryPrevious: function() {
      this.options.router.navigate(this.model.attributes.story.previous, {trigger: true});
    },

    onClickStoryNext: function() {
      this.options.router.navigate(this.model.attributes.story.next, {trigger: true});
    },

    onToggleEditMode: function() {
      if (this.isEditingToggled && this.isModified) {
        if(!confirm("You have unsaved changes. Proceed?")) return;
      }

      var toggled = !this.isEditingToggled;
      this.isEditingToggled = toggled;
      this.surveyView.options.isEditingToggled = toggled;
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

      this.$('.support').html(this.supportView.render().$el);
      // Fetch for submissions and automatically update the element
      this.model.submissionSets[this.supportType].fetchAllPages();

      this.delegateEvents();
      this.surveyView.delegateEvents();

      $("#content article").animate({ scrollTop: 0 }, "fast");
      
      // initialize datetime picker, if relevant
      $('#datetimepicker').datetimepicker({ formatTime: 'g:i a' }); // <-- add to datetimepicker, or could be a handlebars helper?

      if (this.isEditingToggled) {
        $("#toggle-editor-btn").addClass("btn-depressed");
        $(".promotion, .place-submission-details, .survey-header, .reply-link, .response-header").addClass("faded");
        
        // Quill toolbar configuration
        var toolbarOptions = [
          ["bold", "italic", "underline", "strike"],
          [{ "list": "ordered" }, { "list": "bullet" }],
          [{ "header": [1, 2, 3, 4, 5, 6, false] }],
          [{ "color": [] }, { "background": [] }],
          ["link", "image", "video"]
        ],
        quill = new Quill(".place-item-description", {
          modules: { 
            "toolbar": toolbarOptions
          },
          theme: "snow"
        }),
        toolbar = quill.getModule("toolbar"),
        watchFields = "#update-place-model-form, #update-place-model-title-form",
        onEditorChange = function() {
          self.isModified = true;
          $("#update-place-model-btn").css({"opacity": "1.0", "cursor": "pointer"});
          quill.off("text-change", onEditorChange);
          $(watchFields).off("keyup");
        }
        $(".place-item-description").addClass("rawHTML");

        // override default image upload behavior: instead, create an <img>
        // tag with highlighted text set as the src attribute
        toolbar.addHandler("image", function() {
          var range = quill.getSelection();
          quill.insertEmbed(range.index, "image", quill.getText(range.index, range.length), "user");
        });

        // detect changes made via Quill
        quill.on("text-change", onEditorChange);

        // detect changes made to non-Quill form elements
        $(watchFields).on("keyup", function(e) {
          if ((e.keyCode >= 48 && e.keyCode <= 57) // 0-9 (also shift symbols)
              || (e.keyCode >= 65 && e.keyCode <= 90) // a-z (also capital letters)
              || (e.keyCode === 8) // backspace key
              || (e.keyCode === 46) // delete key
              || (e.keyCode === 32) // spacebar
              || (e.keyCode >= 186 && e.keyCode <= 222)) { // punctuation
            onEditorChange();
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
    },

    onInputFileChange: function(evt) {
      var self = this,
          file,
          attachment;

      if(evt.target.files && evt.target.files.length) {
        file = evt.target.files[0];

        this.$('.fileinput-name').text(file.name);
        S.Util.fileToCanvas(file, function(canvas) {
          canvas.toBlob(function(blob) {
            //var fieldName = $(evt.target).attr('name'),
            var fieldName = Math.random().toString(36).substring(7),
                data = {
                  name: fieldName,
                  blob: blob,
                  file: canvas.toDataURL('image/jpeg')
                };

            attachment = self.model.attachmentCollection.find(function(model) {
              return model.get('name') === fieldName;
            });

            if (_.isUndefined(attachment)) {
              self.model.attachmentCollection.add(data);
            } else {
              attachment.set(data);
            }
          }, 'image/jpeg');
        }, {
          // TODO: make configurable
          maxWidth: 800,
          maxHeight: 800,
          canvas: true
        });
      }
    },

    // called by the router
    onCloseWithUnsavedChanges: function() {
      if (confirm("You have unsaved changes. Proceed?")) {
        this.isModified = false;
        return true;
      }

      return false;
    },

    onAddAttachment: function(attachment) {
      attachment.save();
      this.render();
    },

    onBinaryToggle: function(evt) {
      var self = this,
      category = this.model.get("location_type"),
      targetButton = $(evt.target).attr("id"),
      oldValue = $(evt.target).val(),
      // find the matching config data for this element
      selectedCategoryConfig = _.find(this.options.placeConfig.place_detail, function(categoryConfig) { return categoryConfig.category === category; }),
      altData = _.find(selectedCategoryConfig.fields, function(item) { return item.name === targetButton; }),
      // fetch alternate label and value
      altContent = _.find(altData.content, function(item) { return item.value != oldValue; });
      
      // set new value and label
      $(evt.target).val(altContent.value);
      $(evt.target).next("label").html(altContent.label);
    },

    onUpdateModel: function() {
      var self = this,
      richTextAttrs = {};
      // if we have a Quill-enabled field, assume content from this field belongs
      // to the description field. We'll need to make this behavior more sophisticated
      // to support multiple Quill-enabled fields.
      if ($(".ql-editor").html()) {
        richTextAttrs.description = $(".ql-editor").html();
      }
      var attrs = _.extend(S.Util.getAttrs($("#update-place-model-form")), 
        S.Util.getAttrs($("#update-place-model-title-form")),
        richTextAttrs);

      // special handling for binary toggle buttons: we need to remove
      // them completely from the model if they've been unselected in
      // the editor
      $('input[data-input-type="binary_toggle"]').each(function(input) {
        if (!$(this).is(":checked")) {
          self.model.unset($(this).attr("id"));
        }
      });

      this.model.save(attrs, {
        success: function() {
          self.isModified = false;
          self.isEditingToggled = false;
          self.render();
        },
        error: function() {
          // nothing
        }
      });
    },

    onHideModel: function() {
      var self = this;
      if (confirm("Are you sure you want to hide this post? It will no longer be visible on the map.")) { 
        this.model.save({"visible": false}, {
          success: function() {
            self.model.trigger("userHideModel", self.model);
          },
          error: function() {
            // nothing
          }
        });
      }
    }
  });
