const PlaceFormView = require("../../../../../base/static/js/views/place-form-view.js");
const Util = require("../../../../../base/static/js/utils.js");
const TemplateHelpers = require("../../../../../base/static/js/template-helpers.js");
const Gatekeeper = require("../../../../../base/static/libs/gatekeeper.js");

module.exports = PlaceFormView.extend({

  events: {
    "submit form": "onSubmit",
    "change .shareabouts-file-input": "onInputFileChange",
    "change .category-btn": "onCategoryChange",
    'change input[name="title"]': "onTitleChange",
    "click .expansion-icon-container": "onExpandCategories",
    'click input[data-input-type="binary_toggle"]': "onBinaryToggle",
    "change .publish-control-container input": "onPublishedStateChange",
    "click .btn-geolocate": "onClickGeolocate",
    'keyup input[name="url-title"]': "onUpdateUrlTitle",
    "input input[type='range']": "onRangeInputChange",
    // BEGIN FLAVOR-SPECIFIC CODE
    "click #continue-form-btn": "onClickContinueForm",
    "click #exit-survey-btn": "onClickExitSurvey"
    // END FLAVOR-SPECIFIC CODE
  },

  initialize: function() {
    var self = this;

    Backbone.Events.on("panel:close", this.closePanel, this);

    this.resetFormState();
    this.placeDetail = this.options.placeConfig.place_detail;
    this.map = this.options.appView.mapView.map;
    this.geometryEditorView = this.options.geometryEditorView;
    this.geometryEnabled = false;
    // BEGIN FLAVOR-SPECIFIC CODE
    this.formStage = 1;
    // END FLAVOR-SPECIFIC CODE

    TemplateHelpers.overridePlaceTypeConfig(
      this.options.placeConfig.items,
      this.options.defaultPlaceTypeName,
    );
    TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);

    Gatekeeper.registerCollectionsSet(this.options.collectionsSet);

    this.determineRenderabilityForEachCategory();
  },

  // BEGIN FLAVOR-SPECIFIC CODE
  onClickContinueForm: function(evt) {
    this.formStage = 2;
    this.render();
  },

  onClickExitSurvey: function(evt) {
    this.formState.selectedCategoryConfig.fields
      .filter(field => field.autocomplete)
      .forEach(field => {
        Util.removeAutocompleteValue(field.name);
      });

    this.formStage = 1;
    this.center = null;
    this.options.appView.hideCenterPoint();
    this.options.appView.hideNewPin();
    this.options.appView.hidePanel();
  },
  // END FLAVOR-SPECIFIC CODE

  prepareFormFieldsForRender: function() {
    var self = this;

    // Prepare form fields
    this.formState.selectedCategoryConfig.fields.forEach((field, i) => {

      if (this.formState.selectedCategoryConfig.fields[i].type === "commonFormElement") {
        let name = this.formState.selectedCategoryConfig.fields[i].name;
        Object.assign(this.formState.selectedCategoryConfig.fields[i], 
          this.formState.commonFormElements[name]);
      }

      Object.assign(
        this.formState.selectedCategoryConfig.fields[i],
        Util.buildFieldContent(
          field,
          field.autocomplete ? Util.getAutocompleteValue(field.name) : null,
        ),
        self.determineFieldRenderability(
          self.formState.selectedCategoryConfig,
          field,
        ),
      );

      // BEGIN FLAVOR-SPECIFIC CODE
      // Since autocomplete fields are hidden in this flavor, and since
      // binary_toggle buttons are considered to have an autocomplete value
      // whether they've been selected or not, binary toggles need special
      // handling here so they're not always hidden.
      if (this.formState.selectedCategoryConfig.fields[i].type === "binary_toggle") {
        this.formState.selectedCategoryConfig.fields[i].isAutocomplete =
          (Util.getAutocompleteValue(field.name)) ? true : false;
      } else {
        this.formState.selectedCategoryConfig.fields[i].isAutocomplete =
          field.hasValue && field.autocomplete;
      }
      // END FLAVOR-SPECIFIC CODE

    }, this);
  },

  // This is called from the app view
  setLatLng: function(latLng) {
    if (
      !this.options.appView.hasBodyClass("content-expanded-mid") &&
      this.options.appView.hasBodyClass("place-form-visible")
    ) {
      this.options.appView.setBodyClass(
        "content-visible",
        "content-expanded-mid",
      );
      this.options.appView.mapView.map.invalidateSize({
        animate: true,
        pan: true,
      });
    }

    // BEGIN FLAVOR-SPECIFIC CODE
    if (!this.center) {
      this.formStage = 2;
      this.render();
    }
    // END FLAVOR-SPECIFIC CODE

    this.center = latLng;
  },

  render: function() {
    var placesToIncludeOnForm = _.filter(this.placeDetail, function(place) {
      
      console.log(place.category);
      console.log(place.admin_only);
      console.log(Util.getAdminStatus(place.dataset, place.admin_groups));
      console.log(place.includeOnForm);

      // If we're logged in, we have at least two categories to display: the
      // featured places category and the regular comments category
      if (place.admin_only) {
        return (Util.getAdminStatus(place.dataset, place.admin_groups) && place.includeOnForm);
      }

      return place.includeOnForm;
    });

    // BEGIN FLAVOR-SPECIFIC CODE
    if (placesToIncludeOnForm.length === 1) {
      this.formState.selectedCategoryConfig = $.extend(
        true,
        this.formState.selectedCategoryConfig,
        placesToIncludeOnForm[0],
      );

      if (this.formState.selectedCategoryConfig.category === "comment") {

        // If we're in this special comment category, we proceed to a custom
        // multi-stage form.
        switch (this.formStage) {
          case 1:
            this.$el.html(Handlebars.templates["place-form-multi-stage"]());
            break;
          case 2:
            this.setCommonFormElements();
            this.prepareFormFieldsForRender();
            this.$("#place-form").removeClass("is-hidden");
            this.$("#place-form-header").removeClass("is-hidden");
            this.$("#place-form-continue-btns").addClass("is-hidden");
            this.renderFormFields();
            break;
          case 3:
            this.$("#place-form").addClass("is-hidden");
            this.$("#place-form-header").addClass("is-hidden");
            this.$("#place-form-continue-btns").removeClass("is-hidden");
            break;
        }
      }
    } else {
      this.$el.html(Handlebars.templates["place-form"]());
      this.renderCategoryButtons();
    }
    // END FLAVOR-SPECIFIC CODE

    // if (placesToIncludeOnForm.length === 1) {
    //   // If we only have a single category, skip the category selection phase
    //   this.formState.selectedCategoryConfig = $.extend(
    //     true,
    //     this.formState.selectedCategoryConfig,
    //     placesToIncludeOnForm[0],
    //   );
    //   this.setCommonFormElements();
    //   this.setGeometryEnabled();
    //   this.prepareFormFieldsForRender();
    //   this.renderFormFields();
    // } else {
    //   this.renderCategoryButtons();
    // }

    return this;
  },

  onSubmit: Gatekeeper.onValidSubmit(function(evt) {
    var self = this,
      attrs,
      spinner,
      $fileInputs,
      model,
      router = this.options.router,
      collection = this.options.collectionsSet.places[
        self.formState.selectedCategoryConfig.dataset
      ],
      $button = this.$('[name="save-place-btn"]');

    evt.preventDefault();

    this.$el.find("input[name='url-title']").each(function() {
      $(this).val(Util.prepareCustomUrl($(this).val()));
    });

    if (this.geometryEnabled) {
      attrs = this.onComplexSubmit();
    } else {
      attrs = this.onSimpleSubmit();
    }

    if (attrs) {
      collection.add({
        location_type: this.formState.selectedCategoryConfig.category,
        datasetSlug: _.find(this.options.mapConfig.layers, function(layer) {
          return self.formState.selectedCategoryConfig.dataset == layer.id;
        }).slug,
        datasetId: self.formState.selectedCategoryConfig.dataset,
        showMetadata: self.formState.selectedCategoryConfig.showMetadata,
      });
      model = collection.at(collection.length - 1);

      // wrap quill video embeds in a container so we can enable fluid max dimensions
      this.$("iframe.ql-video").each(function(a) {
        $(this).wrap("<div class='ql-video-container'></div>");
      });

      if (self.formState.attachmentData.length > 0) {
        self.formState.attachmentData.forEach(function(attachment) {
          model.attachmentCollection.add(attachment);
        });
      } else {
        // Add rich text content. If we're on this path, it means no images
        // have been embedded.
        self.$(".rich-text-field").each(function() {
          attrs[$(this).attr("name")] = $(this).find(".ql-editor").html();
        });
      }

      $button.attr("disabled", "disabled");
      spinner = new Spinner(Shareabouts.smallSpinnerOptions).spin(
        self.$(".form-spinner")[0],
      );
      Util.log("USER", "new-place", "submit-place-btn-click");
      Util.setStickyFields(
        attrs,
        Shareabouts.Config.survey.items,
        Shareabouts.Config.place.items,
      );

      // Save and redirect
      model.save(attrs, {
        success: function(response) {
          if (
            self.formState.attachmentData.length > 0 &&
            self.$(".rich-text-field").length > 0
          ) {
            // If there is rich text image content on the form, add it now and replace
            // img data urls with their S3 bucket equivalents.
            // NOTE: this success handler is called when all attachment models have
            // saved to the server.
            model.attachmentCollection.fetch({
              reset: true,
              success: function(collection) {
                collection.each(function(attachment) {
                  self
                    .$("img[name='" + attachment.get("name") + "']")
                    .attr("src", attachment.get("file"));
                });

                // Add content that has been modified by Quill rich text fields
                self.$(".rich-text-field").each(function() {
                  attrs[$(this).attr("name")] = $(this).find(".ql-editor").html();
                });

                model.saveWithoutAttachments(attrs, {
                  success: function(response) {
                    Util.log("USER", "new-place", "successfully-add-place");
                    router.navigate(Util.getUrl(model), { trigger: true });
                  },
                  error: function() {
                    Util.log("USER", "new-place", "fail-to-embed-attachments");
                  },
                  complete: function() {
                    if (self.geometryEditorView) {
                      self.geometryEditorView.tearDown();
                    }
                    $button.removeAttr("disabled");
                    spinner.stop();
                    self.resetFormState();
                    collection.each(function(attachment) {
                      attachment.set({ saved: true });
                    });
                  },
                });
              },
              error: function() {
                Util.log("USER", "new-place", "fail-to-fetch-embed-urls");
              },
            });
          } else {
            Util.log("USER", "new-place", "successfully-add-place");

            // BEGIN FLAVOR-SPECIFIC CODE
            if (response.get("datasetId") === "comment") {
              spinner.stop();
              self.formStage = 3;
              self.render();
              // self.resetFormState();
            } else {
              router.navigate(Util.getUrl(model), { trigger: true });
              if (self.geometryEditorView) {
                self.geometryEditorView.tearDown();
              }
              $button.removeAttr("disabled");
            }
            // END FLAVOR-SPECIFIC CODE
          }
        },
        error: function() {
          Util.log("USER", "new-place", "fail-to-add-place");
        },
        wait: true,
      });
    }
  }, null),
});