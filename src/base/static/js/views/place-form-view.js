
  var Util = require('../utils.js');

  var TemplateHelpers = require('../template-helpers.js');
  var RichTextEditorView = require('mapseed-rich-text-editor-view');

  module.exports = Backbone.View.extend({
    events: {
      'submit form': 'onSubmit',
      'change .shareabouts-file-input': 'onInputFileChange',
      'change .category-btn': 'onCategoryChange',
      'click .expansion-icon-container': 'onExpandCategories',
      'click input[data-input-type="binary_toggle"]': 'onBinaryToggle',
      'click .btn-geolocate': 'onClickGeolocate',
      'keyup input[name="url-title"]': 'onUpdateUrlTitle'
    },

    initialize: function() {
      var self = this;

      Backbone.Events.on("panel:close", this.closePanel, this);
      this.options.router.on("route", this.resetFormState, this);

      this.resetFormState();
      this.placeDetail = this.options.placeConfig.place_detail;
      this.map = this.options.appView.mapView.map;
      this.geometryEditorView = this.options.geometryEditorView;
      this.geometryEnabled = false;

      TemplateHelpers.overridePlaceTypeConfig(this.options.placeConfig.items,
        this.options.defaultPlaceTypeName);
      TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);

      Gatekeeper.collectionsSet = this.options.collectionsSet;

      this.determineRenderabilityForEachCategory();
    },

    render: function() {
      this.$el.html(Handlebars.templates['place-form']());
      this.renderGeometryWarningMessage();
      
      var placesToIncludeOnForm = _.filter(this.placeDetail, function(place) { 
        return place.includeOnForm; 
      });

      if (placesToIncludeOnForm.length === 1) {

        // If we only have a single category, skip the category selection phase
        this.formState.selectedCategoryConfig = placesToIncludeOnForm[0];
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
      this.$el
        .find(".place-form-category-buttons")
        .html(Handlebars.templates["place-form-category-buttons"]({
          placeConfig: this.options.placeConfig
        }));
    },

    renderFormFields: function() {
      var data = _.extend({
        placeConfig: this.options.placeConfig,
        selectedCategoryConfig: this.formState.selectedCategoryConfig,
        user_token: this.options.userToken,
        current_user: Shareabouts.currentUser
      }, Shareabouts.stickyFieldValues);

      this.$el
        .find("#place-form")
        .html(Handlebars.templates["place-form-fields"](data));

      if (this.geometryEnabled) {
        this.options.appView.hideCenterPoint();
        this.options.appView.hideSpotlightMask();
        this.geometryEditorView.render({
          $el: this.$el,
          iconUrl: this.formState.selectedCategoryConfig.icon_url
        });
      } else {

        // In case the user switches from a geometry-enabled category
        // to a geometry non-enabled category
        this.geometryEditorView.tearDown();
        this.options.appView.showNewPin();
      }

      this.initializeDatetimePicker();
      this.initializeRichTextFields();
      this.setUrlTitlePrefix();
    },

    setUrlTitlePrefix: function() {
      var self = this, 
      layer = _.find(this.options.mapConfig.layers, function(layer) {
        return layer.id === self.formState.selectedCategoryConfig.dataset;
      });

      this.$el.find(".url-prefix")
        .html(
          window.location.protocol + "//" + window.location.hostname + "/" +
          (layer.useSlugForCustomUrls ? layer.slug + "/" : "")
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
          fields: []
        },
        attachmentData: [],
        commonFormElements: this.options.placeConfig.common_form_elements || {}
      }
    },

    determineRenderabilityForEachCategory: function() {
      _.each(this.options.placeConfig.place_detail, function(place) {
        _.extend(place, {
          isAdmin: Util.getAdminStatus(place.dataset),
          isRenderable: function() {
            if (!place.includeOnForm) {
              return false;
            } else if (place.admin_only && !Util.getAdminStatus(place.dataset)) {
              return false;
            }

            return true;
          }()
        });
      });
    },

    determineFieldRenderability: function(categoryConfig, field) {
      var renderability = {
        isRenderable: true
      }

      if (field.admin_only && !categoryConfig.isAdmin) {
        renderability.isRenderable = false;
      }

      return renderability;
    },

    // Before we render the fields for a given category, do the following:
    // 1. Build an appropriate content object for each field
    // 2. Check the autocomplete status of each field
    // 3. Check the admin-only status of each field
    prepareFormFieldsForRender: function() {
      var self = this;

      // Prepare category-specific fields
      _.each(this.formState.selectedCategoryConfig.fields, function(field, i) { 
        _.extend(this.formState.selectedCategoryConfig.fields[i],
          Util.buildFieldContent(field, (field.autocomplete) ? 
            Util.getAutocompleteValue(field.name) :
            null),
          self.determineFieldRenderability(self.formState.selectedCategoryConfig, field)
        );

        this.formState.selectedCategoryConfig.fields[i].isAutocomplete = 
          (field.hasValue && field.autocomplete) ? true : false;
      }, this);

      // Prepare common form fields
      this.formState.commonFormElements.forEach(function(field, i) {
        _.extend(this.formState.commonFormElements[i],
          Util.buildFieldContent(field, (field.autocomplete) ? 
            Util.getAutocompleteValue(field.name) :
            null),
          self.determineFieldRenderability(self.formState.selectedCategoryConfig, field)
        );

        this.formState.commonFormElements[i].isAutocomplete = 
          (field.hasValue && field.autocomplete) ? true : false;
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
          fieldId: $(this).attr("id")
        });
      });
    },

    initializeDatetimePicker: function() {
      $('#datetimepicker').datetimepicker({ formatTime: 'g:i a' });
    },

    remove: function() {
      this.unbind();
    },

    onError: function(model, res) {
      // TODO handle model errors!
      console.log('oh no errors!!', model, res);
    },

    // This is called from the app view
    setLatLng: function(latLng) {
      
      // Set the form to display at larger size after initial map drag
      if (!this.options.appView.hasBodyClass("content-expanded-mid") &&
          this.options.appView.hasBodyClass("place-form-visible")) {      
        this.options.appView.setBodyClass("content-visible", "content-expanded-mid");
        this.options.appView.mapView.map.invalidateSize({ animate:true, pan:true });
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
          $form = this.$('form'),
          attrs = Util.getAttrs($form); 

      // Get values off of binary toggle buttons that have not been toggled
      $.each($("input[data-input-type='binary_toggle']:not(:checked)"), function() {
        attrs[$(this).attr("name")] = $(this).val();
      });

      _.each(attrs, function(value, key) {
        var itemConfig = _.find(
          self.formState.selectedCategoryConfig.fields
            .concat(self.formState.commonFormElements), function(field) { 
              return field.name === key;
            }) || {};
        if (itemConfig.autocomplete) {
          Util.saveAutocompleteValue(key, value, 30);
        }
      });

      // Add content that has been modified by Quill rich text fields
      this.$(".rich-text-field").each(function() {
        attrs[$(this).attr("name")] = $(this).find(".ql-editor").html();
      });
      
      if (this.geometryEnabled) {
        attrs.geometry = this.geometryEditorView.geometry;
      } else {
        
        // If the selected category does not have geometry editing enabled,
        // assume we're adding point geometry
        attrs.geometry = {
          type: 'Point',
          coordinates: [this.center.lng, this.center.lat]
        }
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
        .animate( { height: "hide" }, 400 );
    },

    expandCategorySiblings: function() {
      $(".category-btn")
        .parent()
        .animate( { height: "show" }, 400 );
    },

    onCategoryChange: function(evt) {
      this.resetFormState();
      
      var self = this,
          categoryConfig = _.find(this.placeDetail, function(place) {
            return place.category === $(evt.target).attr("id");
          });

      this.formState.selectedCategoryConfig = 
        $.extend(true, this.formState.selectedCategoryConfig, categoryConfig);

      if (_.find(this.formState.selectedCategoryConfig.fields, function(field) {
        return field.type === "geometryToolbar";
      })) {
        this.geometryEnabled = true;
      } else {
        this.geometryEnabled = false;
      }
      
      this.hideSilhouettes();
      this.hideCategorySeparator();
      this.prepareFormFieldsForRender();
      this.collapseCategorySiblings(evt.target);
      this.renderFormFields();
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
          ll = this.options.appView.mapView.map.getBounds().toBBoxString();
      
      Util.log('USER', 'map', 'geolocate', ll, this.options.appView.mapView.map.getZoom());
      
      $("#geolocating-msg").removeClass("is-visuallyhidden");

      this.options.appView.mapView.map.locate()
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

        this.$('.fileinput-name').text(file.name);
        Util.fileToCanvas(file, function(canvas) {
          canvas.toBlob(function(blob) {
            self.formState.attachmentData.push({
              name: $(evt.target).attr('name'),
              blob: blob,
              file: canvas.toDataURL('image/jpeg')
            })
          }, 'image/jpeg');
        }, {
          // TODO: make configurable
          maxWidth: 800,
          maxHeight: 800,
          canvas: true
        });
      }
    },

    onBinaryToggle: function(evt) {
      var oldValue = $(evt.target).val(),
          newValue = $(evt.target).data("alt-value"),
          oldLabel = $(evt.target).siblings("label").html(),
          newLabel = $(evt.target).siblings("label").data("alt-label");

      // swap new and old values and labels
      $(evt.target).data("alt-value", oldValue);
      $(evt.target).val(newValue);
      $(evt.target).siblings("label").html(newLabel);
      $(evt.target).siblings("label").data("alt-label", oldLabel);
    },

    closePanel: function() {
      this.center = null;
      this.resetFormState();
    },

    // This function handles submission of data from conventional places with 
    // map drag-based point geometry only
    onSimpleSubmit: function() {
      if (!this.center) {
        this.setGeometryWarningMessage(".drag-marker-warning-msg");

        return false;
      }

      var attrs = this.getAttrs();
      return attrs;
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
          fillOpacity: this.geometryEditorView.colorpickerSettings.fillOpacity
        }
      } else if (attrs.geometry.type === "Point") {
        attrs["style"] = {
          iconUrl: this.geometryEditorView.iconUrl
        }
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
          collection = this.options.collectionsSet.places[self.formState.selectedCategoryConfig.dataset],
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
        collection.add({"location_type": this.formState.selectedCategoryConfig.category});
        model = collection.at(collection.length - 1);
        model.set("datasetSlug", _.find(this.options.mapConfig.layers, function(layer) { 
          return self.formState.selectedCategoryConfig.dataset == layer.id;
        }).slug);
        model.set("datasetId", self.formState.selectedCategoryConfig.dataset);

        // if an attachment has been added...
        if (self.formState.attachmentData) {
          var attachment = model.attachmentCollection.find(function(attachmentModel) {
            return attachmentModel.get('name') === self.formState.attachmentData.name;
          });

          if (_.isUndefined(attachment)) {
            model.attachmentCollection.add(self.formState.attachmentData);
          } else {
            attachment.set(self.formState.attachmentData);
          }
        }

        $button.attr('disabled', 'disabled');
        spinner = new Spinner(Shareabouts.smallSpinnerOptions).spin(self.$('.form-spinner')[0]);
        Util.log('USER', 'new-place', 'submit-place-btn-click');
        Util.setStickyFields(attrs, Shareabouts.Config.survey.items, Shareabouts.Config.place.items);

        // Save and redirect
        model.save(attrs, {
          success: function() {
            Util.log('USER', 'new-place', 'successfully-add-place');
            router.navigate(Util.getUrl(model), { trigger: true });
          },
          error: function() {
            Util.log('USER', 'new-place', 'fail-to-add-place');
          },
          complete: function() {
            if (self.geometryEditorView) {
              self.geometryEditorView.tearDown();
            }
            $button.removeAttr('disabled');
            spinner.stop();
            self.resetFormState();
          },
          wait: true
        });
      }
    }, null)
  });
