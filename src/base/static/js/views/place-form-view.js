import accessibleAutocomplete from 'accessible-autocomplete';

var Util = require("../utils.js");
var Gatekeeper = require("../../libs/gatekeeper.js");
var GeocodeAddressPlaceView = require("mapseed-geocode-address-place-view");

var TemplateHelpers = require("../template-helpers.js");
var RichTextEditorView = require("mapseed-rich-text-editor-view");

module.exports = Backbone.View.extend({
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
  },

  initialize: function() {
    var self = this;

    Backbone.Events.on("panel:close", this.closePanel, this);

    this.resetFormState();
    this.placeDetail = this.options.placeConfig.place_detail;
    this.map = this.options.appView.mapView.map;
    this.geometryEditorView = this.options.geometryEditorView;
    this.geometryEnabled = false;

    TemplateHelpers.overridePlaceTypeConfig(
      this.options.placeConfig.items,
      this.options.defaultPlaceTypeName,
    );
    TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);

    Gatekeeper.registerCollectionsSet(this.options.collectionsSet);

    this.determineRenderabilityForEachCategory();
  },

  render: function() {
    this.$el.html(Handlebars.templates["place-form"]());
    this.renderGeometryWarningMessage();

    var placesToIncludeOnForm = _.filter(this.placeDetail, function(place) {
      return place.includeOnForm;
    });

    if (placesToIncludeOnForm.length === 1) {
      // If we only have a single category, skip the category selection phase
      this.formState.selectedCategoryConfig = placesToIncludeOnForm[0];
      this.setCommonFormElements();
      this.setGeometryEnabled();
      this.prepareFormFieldsForRender();
      this.renderFormFields();
    } else {
      this.renderCategoryButtons();
    }

    return this;
  },

  renderGeometryWarningMessage: function() {
    this.$el
      .find(".place-form-geometry-messages")
      .html(Handlebars.templates["place-form-messages"]());
  },

  renderCategoryButtons: function() {
    this.$el.find(".place-form-category-buttons").html(
      Handlebars.templates["place-form-category-buttons"]({
        placeConfig: this.options.placeConfig,
      }),
    );
  },

  renderFormFields: function() {
    var self = this,
      data = _.extend(
        {
          placeConfig: this.options.placeConfig,
          commonFormElements: this.formState.commonFormElements,
          selectedCategoryConfig: this.formState.selectedCategoryConfig,
          user_token: this.options.userToken,
          current_user: Shareabouts.currentUser,
        },
        Shareabouts.stickyFieldValues,
      );

    this.$el
      .find("#place-form")
      .html(Handlebars.templates["place-form-fields"](data));

    this.$el.find(".is-published-msg-editor").addClass("hidden");

    if (this.geometryEnabled) {
      this.options.appView.hideCenterPoint();
      this.options.appView.hideSpotlightMask();
      this.geometryEditorView.render({
        $el: this.$el,
        iconUrl: this.formState.selectedCategoryConfig.icon_url,
      });
    } else {
      // In case the user switches from a geometry-enabled category
      // to a geometry non-enabled category
      this.geometryEditorView.tearDown();
      this.options.appView.showNewPin();
    }

    this.geocodeAddressPlaceView = new GeocodeAddressPlaceView({
      el: this.$("#geocode-address-place-bar"),
      router: this.options.router,
      mapConfig: this.options.mapConfig,
    }).render();

    this.initializeDatetimePicker();
    this.initializeRichTextFields();
    this.setUrlTitlePrefix();

    this.$qlToolbar = this.$(".ql-toolbar");

    // Make sure the Quill toolbar never scrolls out of sight by fixing it to
    // the top of the content container.
    if (this.$qlToolbar.length > 0) {
      $("#content article").on("scroll", function() {
        if (this.scrollTop < 1060) {
          self.$qlToolbar.removeClass("fixed-top no-edit-toolbar");
        } else if (self.$qlToolbar.offset().top < 75) {
          self.$qlToolbar.addClass("fixed-top no-edit-toolbar");
        }
      });
    }

    // Set up autocomplete comboboxes
    Array.prototype.forEach.call(
      document.getElementsByClassName("dropdown-autocomplete-container"),
      (elt) => {
        let node = document.getElementsByName(elt.name)[0],
            optionsArray = Array.prototype.map.call(
              node.options,
              (opt) => {
                return opt.textContent
              }
            );

        accessibleAutocomplete.enhanceSelectElement({
          id: node.id,
          selectElement: node,
          displayMenu: "overlay",
          showAllValues: true,
          required: node.required,
          placeholder: node.dataset.placeholder,
          onConfirm: function(confirmed) {
            if (confirmed) {

              // Set the value of the underlying select element
              document.getElementById(this.id + "-select").selectedIndex = 
                optionsArray.indexOf(confirmed);
            }
          }
        });

        // Remove a required attribute on the underlying select element, to 
        // prevent problems with validating a hidden element
        node.required = false;
      }
    );
  },

  setUrlTitlePrefix: function() {
    var self = this,
      layer = _.find(this.options.mapConfig.layers, function(layer) {
        return layer.id === self.formState.selectedCategoryConfig.dataset;
      });

    this.$el
      .find(".url-prefix")
      .html(
        window.location.protocol +
          "//" +
          window.location.hostname +
          "/" +
          (layer.useSlugForCustomUrls ? layer.slug + "/" : ""),
      );
  },

  showCategorySeparator: function() {
    this.$("#category-btns hr").show();
  },

  hideCategorySeparator: function() {
    this.$("#category-btns hr").hide();
  },

  hideSilhouettes: function() {
    this.$(".place-form-silhouettes").hide();
  },

  resetFormState: function() {
    this.formState = {
      selectedCategoryConfig: {
        fields: [],
      },
      attachmentData: [],
      commonFormElements: [],
    };
  },

  determineRenderabilityForEachCategory: function() {
    _.each(this.options.placeConfig.place_detail, function(place) {
      _.extend(place, {
        isAdmin: Util.getAdminStatus(place.dataset, place.admin_groups),
        isRenderable: (function() {
          if (!place.includeOnForm) {
            return false;
          } else if (place.admin_only && !Util.getAdminStatus(place.dataset, place.admin_groups)) {
            return false;
          }

          return true;
        })(),
      });
    });
  },

  determineFieldRenderability: function(categoryConfig, field) {
    var renderability = {
      isRenderable: true,
    };

    if (field.admin_only && !categoryConfig.isAdmin) {
      renderability.isRenderable = false;
    }

    return renderability;
  },

  // Before we render the fields for a given category, do the following:
  // 1. Resolve common_form_elements
  // 2. Build an appropriate content object for each field
  // 3. Check the autocomplete status of each field
  // 4. Check the admin-only status of each field
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

      this.formState.selectedCategoryConfig.fields[i].isAutocomplete =
        field.hasValue && field.autocomplete;
    }, this);
  },

  initializeRichTextFields: function() {
    var self = this;

    this.$(".rich-text-field").each(function() {
      new RichTextEditorView({
        el: $(this).get(0),
        model: this.model,
        placeFormView: self,
        fieldName: $(this).attr("name"),
        fieldId: $(this).attr("id"),
      });
    });
  },

  initializeDatetimePicker: function() {
    $("#datetimepicker").datetimepicker({ formatTime: "g:i a" });
  },

  remove: function() {
    this.unbind();
  },

  onError: function(model, res) {
    // TODO handle model errors!
    console.log("oh no errors!!", model, res);
  },

  // This is called from the app view
  setLatLng: function(latLng) {
    // Set the form to display at larger size after initial map drag
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

    this.center = latLng;
    this.clearGeometryWarningMessage();
  },

  setLocation: function(location) {
    this.location = location;
  },

  getAttrs: function() {
    var self = this,
      attrs = {},
      locationAttr = this.options.placeConfig.location_item_name,
      $form = this.$("form"),
      attrs = Util.getAttrs($form);

    // Get values off of binary toggle buttons that have not been toggled
    $.each(
      $("input[data-input-type='binary_toggle']:not(:checked)"),
      function() {
        attrs[$(this).attr("name")] = $(this).val();
      },
    );

    _.each(attrs, function(value, key) {
      var itemConfig =
        _.find(
          self.formState.selectedCategoryConfig.fields.concat(
            self.formState.commonFormElements,
          ),
          function(field) {
            return field.name === key;
          },
        ) || {};
      if (itemConfig.autocomplete) {
        Util.saveAutocompleteValue(key, value, 30);
      }
    });

    if (this.geometryEnabled) {
      attrs.geometry = this.geometryEditorView.geometry;
    } else {
      // If the selected category does not have geometry editing enabled,
      // assume we're adding point geometry
      attrs.geometry = {
        type: "Point",
        coordinates: [this.center.lng, this.center.lat],
      };
    }

    if (this.location && locationAttr) {
      attrs[locationAttr] = this.location;
    }

    return attrs;
  },

  collapseCategorySiblings: function(target) {
    $(target)
      .prop("checked", true)
      .parent()
      .siblings()
      .animate({ height: "hide" }, 400);
  },

  expandCategorySiblings: function() {
    $(".category-btn").parent().animate({ height: "show" }, 400);
  },

  setGeometryEnabled: function() {
    this.geometryEnabled = _.find(
      this.formState.selectedCategoryConfig.fields,
      function(field) {
        return field.type === "geometryToolbar";
      },
    )
      ? true
      : false;
  },

  setCommonFormElements: function() {
    this.formState.commonFormElements = $.extend(
      true,
      this.formState.commonFormElements,
      this.options.placeConfig.common_form_elements,
    );
  },

  onCategoryChange: function(evt) {
    this.resetFormState();

    var self = this,
      categoryConfig = _.find(this.placeDetail, function(place) {
        return place.category === $(evt.target).attr("id");
      });

    this.formState.selectedCategoryConfig = $.extend(
      true,
      this.formState.selectedCategoryConfig,
      categoryConfig,
    );

    this.setCommonFormElements();
    this.setGeometryEnabled();
    this.hideSilhouettes();
    this.hideCategorySeparator();
    this.prepareFormFieldsForRender();
    this.collapseCategorySiblings(evt.target);
    this.renderFormFields();
  },

  onTitleChange: function(evt) {
    var url = Util.prepareCustomUrl(evt.target.value);

    this.$el.find("input[name='url-title']").val(url);

    this.$el.find(".url-readout").html(url);
  },

  onUpdateUrlTitle: function(evt) {
    $(evt.currentTarget)
      .siblings(".url-readout-container")
      .find(".url-readout")
      .html(Util.prepareCustomUrl($(evt.currentTarget).val()));
  },

  onExpandCategories: function(evt) {
    this.showCategorySeparator();
    this.expandCategorySiblings();
  },

  onClickGeolocate: function(evt) {
    evt.preventDefault();

    var self = this,
      latLng = this.options.appView.mapView.map.getBounds().toBBoxString();

    Util.log(
      "USER",
      "map",
      "geolocate",
      latLng,
      this.options.appView.mapView.map.getZoom(),
    );

    $("#geolocating-msg").removeClass("is-visuallyhidden");

    this.options.appView.mapView.map
      .locate()
      .on("locationfound", function() {
        self.center = self.options.appView.mapView.map.getCenter();
        $("#spotlight-mask").hide();
        $("#drag-marker-content").addClass("is-visuallyhidden");
      })
      .on("locationerror", function() {
        $("#drag-marker-content").removeClass("is-visuallyhidden");
        $("#geolocating-msg").addClass("is-visuallyhidden");
      });
  },

  onInputFileChange: function(evt) {
    var self = this,
      file,
      attachment;

    if (evt.target.files && evt.target.files.length) {
      file = evt.target.files[0];

      this.$(".fileinput-name").text(file.name);
      Util.fileToCanvas(
        file,
        function(canvas) {
          canvas.toBlob(function(blob) {
            self.formState.attachmentData.push({
              name: $(evt.target).attr("name"),
              blob: blob,
              file: canvas.toDataURL("image/jpeg"),
            });
          }, "image/jpeg");
        },
        {
          // TODO: make configurable
          maxWidth: 800,
          maxHeight: 800,
          canvas: true,
        },
      );
    }
  },

  onPublishedStateChange: function(evt) {
    Util.onPublishedStateChange(evt, "form");
  },

  onBinaryToggle: function(evt) {
    Util.onBinaryToggle(evt);
  },

  closePanel: function() {
    this.center = null;
    this.resetFormState();
    $("#content article").off("scroll");
  },

  // This function handles submission of data from conventional places with
  // map drag-based point geometry only
  onSimpleSubmit: function() {
    if (!this.center) {
      this.setGeometryWarningMessage(".drag-marker-warning-msg");

      return false;
    }

    return this.getAttrs();
  },

  // This function handles submission of data from geometry-enabled places,
  // which can generate point, polyline, or polygon geometry
  onComplexSubmit: function() {
    if (this.geometryEditorView.editingLayerGroup.getLayers().length === 0) {
      // If the map has an editingLayerGroup with no layers in it, it means the
      // user hasn't created any geometry
      this.setGeometryWarningMessage(".no-geometry-warning-msg");

      return false;
    }

    // Save any geometry edits made that the use might not have explicitly
    // saved herself
    this.geometryEditorView.saveWorkingGeometry();

    var attrs = this.getAttrs();
    if (attrs.geometry.type !== "Point") {
      attrs["style"] = {
        color: this.geometryEditorView.colorpickerSettings.color,
        opacity: this.geometryEditorView.colorpickerSettings.opacity,
        fillColor: this.geometryEditorView.colorpickerSettings.fillColor,
        fillOpacity: this.geometryEditorView.colorpickerSettings.fillOpacity,
      };
    } else if (attrs.geometry.type === "Point") {
      attrs["style"] = {
        iconUrl: this.geometryEditorView.iconUrl,
      };
    }

    return attrs;
  },

  clearGeometryWarningMessage: function() {
    this.$(".place-form-geometry-messages p").addClass("hidden");
  },

  setGeometryWarningMessage: function(messageClass) {
    this.clearGeometryWarningMessage();
    this.$(".place-form-geometry-messages")
      .find(messageClass)
      .removeClass("hidden");

    this.$el.parent("article").scrollTop(0);
    window.scrollTo(0, 0);
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
            // Otherwise, go ahead and route to the newly-created place.
            Util.log("USER", "new-place", "successfully-add-place");
            router.navigate(Util.getUrl(model), { trigger: true });
            if (self.geometryEditorView) {
              self.geometryEditorView.tearDown();
            }
            $button.removeAttr("disabled");
            spinner.stop();
            self.resetFormState();
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
