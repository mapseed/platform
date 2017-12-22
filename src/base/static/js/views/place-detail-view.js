var Util = require("../utils.js");
var Gatekeeper = require("../../libs/gatekeeper.js");

var SurveyView = require("mapseed-survey-view");
var SupportView = require("mapseed-support-view");
var RichTextEditorView = require("mapseed-rich-text-editor-view");

var SubmissionCollection = require("../models/submission-collection.js");

const TOOLBAR_FIXED_TOP_THRESHOLD = 1660;

module.exports = Backbone.View.extend({
  events: {
    "click .place-story-bar .btn-previous-story-nav": "onClickStoryPrevious",
    "click .place-story-bar .btn-next-story-nav": "onClickStoryNext",
    "click #toggle-editor-btn": "onToggleEditMode",
    "click #update-place-model-btn": "onUpdateModel",
    "click #hide-place-model-btn": "onHideModel",
    'click input[data-input-type="binary_toggle"]': "onBinaryToggle",
    "change .publish-control-container input": "onPublishedStateChange",
    "change input, textarea": "saveDraftChanges",
    'keyup input[name="url-title"]': "onUpdateUrlTitle",
    "click .share-twitter": "onShareTwitter",
    "click .share-facebook": "onShareFacebook",
  },
  initialize: function() {
    var self = this;

    this.categoryConfig = _.findWhere(this.options.placeConfig.place_detail, {
      category: this.model.get("location_type"),
    });
    this.isEditable = Util.getAdminStatus(this.options.datasetId, this.categoryConfig.admin_groups);
    this.isEditingToggled = false;
    this.surveyType = this.options.surveyConfig.submission_type;
    this.supportType = this.options.supportConfig.submission_type;
    this.isModified = false;
    this.commonFormElements = this.options.placeConfig.common_form_elements;
    this.geometryEditorView = this.options.geometryEditorView;
    this.onAddAttachmentCallback = null;
    this.geometryEnabled = _.find(this.categoryConfig.fields, function(field) {
      return field.type === "geometryToolbar";
    })
      ? true
      : false;

    if (!Gatekeeper.collectionsSet) {
      Gatekeeper.registerCollectionsSet(this.options.collectionsSet);
    }

    // use the current url as the key under which to store draft changes made
    // to this place detail view
    this.LOCALSTORAGE_KEY = Backbone.history.getFragment().replace("/", "-");

    // consider the editor modified if change or keyup events are registered
    // from the following selectors
    this.WATCH_FIELDS =
      "#update-place-model-form, #update-place-model-title-form";

    // Make sure the submission collections are set
    this.model.submissionSets[this.surveyType] =
      this.model.submissionSets[this.surveyType] ||
      new SubmissionCollection(null, {
        submissionType: this.surveyType,
        placeModel: this.model,
      });

    this.model.submissionSets[this.supportType] =
      this.model.submissionSets[this.supportType] ||
      new SubmissionCollection(null, {
        submissionType: this.supportType,
        placeModel: this.model,
      });

    this.surveyView = new SurveyView({
      collection: this.model.submissionSets[this.surveyType],
      surveyConfig: this.options.surveyConfig,
      userToken: this.options.userToken,
      datasetId: self.options.datasetId,
      placeDetailView: self,
    });

    this.supportView = new SupportView({
      collection: this.model.submissionSets[this.supportType],
      supportConfig: this.options.supportConfig,
      userToken: this.options.userToken,
      datasetId: self.options.datasetId,
    });

    // fetch comments here instead of in render(), to avoid fetching on
    // a re-render and possibly conflicting with in-progress update/delete calls
    this.model.submissionSets[this.surveyType].fetchAllPages();

    this.model.attachmentCollection.on(
      "add",
      this.onAddAttachmentWrapper,
      this,
    );

    this.$el.on("click", ".share-link a", function(evt) {
      // HACK! Each action should have its own view and bind its own events.
      var shareTo = this.getAttribute("data-shareto");

      Util.log("USER", "place", shareTo, self.model.getLoggingDetails());
    });
  },

  setUrlTitlePrefix: function() {
    var self = this,
      layer = _.find(this.options.mapConfig.layers, function(layer) {
        return layer.id === self.model.get("datasetId");
      });

    this.$el
      .find(".url-prefix")
      .html(window.location.protocol + "//" + window.location.hostname + "/");

    this.$el.find(".url-readout").html(Util.getUrl(this.model));
  },

  onUpdateUrlTitle: function(evt) {
    var urlReadout = $(evt.currentTarget)
      .siblings(".url-readout-container")
      .find(".url-readout");

    if ($(evt.currentTarget).val() === "") {
      urlReadout.html(Util.getShareaboutsUrl(this.model));
    } else {
      urlReadout.html(Util.prepareCustomUrl($(evt.currentTarget).val()));
    }
  },

  onAddAttachmentWrapper: function(attachment) {
    this.onAddAttachmentCallback.call(
      this.onAddAttachmentCallbackContext,
      attachment,
    );
  },

  saveDraftChanges: function() {
    var attrs = this.scrapeForm();
    Util.localstorage.save(this.LOCALSTORAGE_KEY, attrs, 30); // save for 30 days
  },

  clearDraftChanges: function() {
    Util.localstorage.destroy(this.LOCALSTORAGE_KEY);
  },

  onShareTwitter: function() {
    Util.onSocialShare(this.model, "twitter");
  },
  onShareFacebook: function() {
    Util.onSocialShare(this.model, "facebook");
  },

  onClickStoryPrevious: function() {
    this.options.router.navigate(this.model.attributes.story.previous, {
      trigger: true,
    });
  },

  onClickStoryNext: function() {
    this.options.router.navigate(this.model.attributes.story.next, {
      trigger: true,
    });
  },

  onPublishedStateChange: function(evt) {
    Util.onPublishedStateChange(evt, "editor");
  },

  onBinaryToggle: function(evt) {
    Util.onBinaryToggle(evt);
  },

  onToggleEditMode: function() {
    if (this.isEditingToggled) {
      this.isModified = false;
      if (this.isModified) {
        this.saveDraftChanges();
      }
      if (this.geometryEnabled) {
        this.geometryEditorView.tearDown();
      }
    }

    this.isEditingToggled = !this.isEditingToggled;
    this.surveyView.options.isEditingToggled = this.isEditingToggled;
    this.render();

    if (this.isEditingToggled) {
      this.setUrlTitlePrefix();

      if (this.geometryEnabled) {
        this.options.appView.hideSpotlightMask();
        this.geometryEditorView.render({
          $el: this.$el,
          style: this.model.get("style"),
          layerType: this.model.get("geometry").type,
          existingLayerView: this.options.layerView,
          placeDetailView: this,
        });
      }

      this.$el
        .find("#update-place-model-title-form")
        .on("submit", function(evt) {
          evt.preventDefault();
        });
      this.$el.find(".is-published-msg-form").addClass("hidden");
    }
  },

  buildFieldListForRender: function() {
    this.fields = Util.buildFieldListForRender({
      exclusions: [
        "submitter_name",
        "name",
        "location_type",
        "title",
        "my_image",
      ],
      model: this.model,
      fields: this.categoryConfig.fields,
      commonFormElements: this.commonFormElements,
      isEditingToggled: this.isEditingToggled,
    });
  },

  render: function() {
    this.buildFieldListForRender();

    var self = this,
      data = _.extend(
        {
          place_config: this.options.placeConfig,
          survey_config: this.options.surveyConfig,
          url: this.options.url,
          isEditable: this.isEditable || false,
          isEditingToggled: this.isEditingToggled || false,
          isModified: this.isModified,
          fields: this.fields,
          suppressAttachments: this.categoryConfig.suppressAttachments,
        },
        this.model.toJSON(),
      );

    this.options.router.on("route", this.tearDown, this);

    data.submitter_name =
      this.model.get("submitter_name") ||
      this.options.placeConfig.anonymous_name;

    // Augment the template data with the attachments list
    data.attachments = this.model.attachmentCollection.toJSON();

    // Augment the data with any draft changes saved to localstorage
    if (this.isEditingToggled && Util.localstorage.get(this.LOCALSTORAGE_KEY)) {
      this.isModified = true;
      data.isModified = true;
      _.extend(data, Util.localstorage.get(this.LOCALSTORAGE_KEY));
    }

    this.$el.html(Handlebars.templates["place-detail"](data));

    // Render the view as-is (collection may have content already)
    this.$(".survey").html(this.surveyView.render().$el);

    this.$(".support").html(this.supportView.render().$el);
    // Fetch for submissions and automatically update the element
    this.model.submissionSets[this.supportType].fetchAllPages();

    this.delegateEvents();
    this.surveyView.delegateEvents();

    // initialize datetime picker, if relevant
    $("#datetimepicker").datetimepicker({ formatTime: "g:i a" });

    if (this.isEditingToggled) {
      $("#toggle-editor-btn").addClass("btn-depressed");
      $(
        ".promotion, .place-submission-details, .survey-header, .reply-link, .response-header",
      ).addClass("faded");

      // detect changes made to non-Quill form elements
      $(this.WATCH_FIELDS).on("keyup change", function(e) {
        if (e.type === "change") {
          self.onModified();
        } else if (
          (e.keyCode >= 48 && e.keyCode <= 57) || // 0-9 (also shift symbols)
          (e.keyCode >= 65 && e.keyCode <= 90) || // a-z (also capital letters)
          e.keyCode === 8 || // backspace key
          e.keyCode === 46 || // delete key
          e.keyCode === 32 || // spacebar
          (e.keyCode >= 186 && e.keyCode <= 222)
        ) {
          // punctuation

          self.onModified();
        }
      });

      $(".rich-text-field").each(function() {
        new RichTextEditorView({
          el: $(this).get(0),
          model: self.model,
          placeDetailView: self,
          fieldName: $(this).attr("name"),
          fieldId: $(this).attr("id"),
        });
      });

      $("#content article").animate({ scrollTop: 0 }, "fast");

      this.$qlToolbar = this.$(".ql-toolbar");

      // Make sure the Quill toolbar never scrolls out of sight by fixing it to
      // the top of the content container, right below the edit toolbar.
      if (this.$qlToolbar.length > 0) {
        $("#content article").on("scroll", function() {
          if (this.scrollTop < TOOLBAR_FIXED_TOP_THRESHOLD) {
            self.$qlToolbar.removeClass("fixed-top");
          } else if (self.$qlToolbar.offset().top < 115) {
            self.$qlToolbar.addClass("fixed-top");
          }
        });
      }
    }

    return this;
  },

  tearDown: function() {
    this.options.router.off("route", this.tearDown, this);
    $("#content article").off("scroll");
    this.isEditingToggled = false;
    this.isModified = false;
  },

  onModified: function() {
    this.isModified = true;
    $("#update-place-model-btn").addClass("isModified");
    $(this.WATCH_FIELDS).off("keyup change");
  },

  remove: function() {
    // Nothing yet
  },

  // called by the router
  onCloseWithUnsavedChanges: function() {
    // NOTE: draft changes are saved in localstorage, so we allow the user to
    // close the editor without warning.
    // if (confirm("You have unsaved changes. Proceed?")) {
    //   this.isModified = false;
    //   return true;
    // }

    // return false;

    return true;
  },

  scrapeForm: function() {
    var self = this,
      richTextAttrs = {};

    // wrap quill video embeds in a container so we can enable fluid max dimensions
    this.$("iframe.ql-video").each(function() {
      $(this).wrap("<div class='ql-video-container'></div>");
    });

    // attach data from Quill-enabled fields
    this.$el.find(".ql-editor").each(function() {
      richTextAttrs[$(this).data("fieldName")] = $(this).html();
    });

    this.$el.find("input[name='url-title']").each(function() {
      $(this).val(Util.prepareCustomUrl($(this).val()));
    });

    var attrs = _.extend(
      Util.getAttrs($("#update-place-model-form")),
      Util.getAttrs($("#update-place-model-title-form")),
      richTextAttrs,
    );

    // Special handling for binary toggle buttons: we need to remove
    // them completely from the model if they've been unselected in
    // the editor
    this.$el
      .find("#update-place-model-form input[data-input-type='binary_toggle']")
      .each(function(input) {
        if (!$(this).is(":checked")) {
          self.model.unset($(this).attr("id"));
        }
      });

    // Special handling for checkbox groups: if all items in a checkbox group
    // have been unselected, remove the group completely from the model
    this.$el
      .find("#update-place-model-form .checkbox-group")
      .each(function(group) {
        if ($(this).find("input:checkbox:checked").length === 0) {
          self.model.unset($(this).find(":first-child").attr("name"));
        }
      });

    return attrs;
  },

  onUpdateModel: Gatekeeper.onValidSubmit(function(evt) {
    if (!this.isModified) {
      return;
    }

    var self = this,
      attrs = this.scrapeForm();

    if (this.geometryEnabled) {
      // Save any geometry edits made that the user might not have explicitly
      // saved herself
      this.geometryEditorView.saveWorkingGeometry();
      attrs.geometry =
        this.geometryEditorView.geometry || this.model.get("geometry");

      if (
        attrs.geometry.type === "Polygon" ||
        attrs.geometry.type === "LineString"
      ) {
        attrs.style = {
          color: this.geometryEditorView.colorpickerSettings.color,
          opacity: this.geometryEditorView.colorpickerSettings.opacity,
          fillColor: this.geometryEditorView.colorpickerSettings.fillColor,
          fillOpacity: this.geometryEditorView.colorpickerSettings.fillOpacity,
        };
      } else if (attrs.geometry.type === "Point") {
        attrs.style = {
          iconUrl: this.geometryEditorView.iconUrl,
        };
      }

      this.geometryEditorView.tearDown();
    }

    this.model.save(attrs, {
      success: function() {
        self.clearDraftChanges();
        self.isModified = false;
        self.isEditingToggled = false;
        self.render();

        if (Backbone.history.fragment === Util.getUrl(self.model)) {
          Backbone.history.loadUrl(Backbone.history.fragment);
        } else {
          self.options.router.navigate(Util.getUrl(self.model), {
            trigger: true,
            replace: true,
          });
        }
      },
    });
  }, null),

  onHideModel: function() {
    var self = this;
    if (
      confirm(
        "Are you sure you want to remove this post? It will no longer be visible on the map.",
      )
    ) {
      if (this.geometryEnabled) {
        this.geometryEditorView.existingLayerView = null;
        this.geometryEditorView.tearDown();
      }
      this.model.save(
        { visible: false },
        {
          success: function() {
            self.model.trigger("userHideModel", self.model);
          },
        },
      );
    }
  },
});
