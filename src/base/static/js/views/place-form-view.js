
  var Util = require('../utils.js');
  var GeocodeAddressPlaceView = require('mapseed-geocode-address-place-view');

  var TemplateHelpers = require('../template-helpers.js');
  var RichTextEditorView = require('mapseed-rich-text-editor-view');

  module.exports = Backbone.View.extend({
    events: {
      'submit form': 'onSubmit',
      'change .shareabouts-file-input': 'onInputFileChange',
      'click .category-btn.clickable': 'onCategoryChange',
      'click .category-menu-hamburger': 'onExpandCategories',
      'click input[data-input-type="binary_toggle"]': 'onBinaryToggle',
      'click .btn-geolocate': 'onClickGeolocate'
    },
    initialize: function() {
      var self = this;

      Backbone.Events.on("panel:close", this.closePanel, this);

      this.resetFormState();
      this.options.router.on("route", this.resetFormState, this);
      this.placeDetail = this.options.placeConfig.place_detail;
      this.map = this.options.appView.mapView.map;
      this.geometryEditorView = this.options.geometryEditorView;
      this.geometryEnabled = false;

      TemplateHelpers.overridePlaceTypeConfig(this.options.placeConfig.items,
        this.options.defaultPlaceTypeName);
      TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);

      this.determineAdminStatus();
    },
    resetFormState: function() {
      this.formState = {
        selectedCategoryConfig: {
          fields: []
        },
        isSingleCategory: false,
        attachmentData: [],
        commonFormElements: this.options.placeConfig.common_form_elements || {}
      }
    },
    // Augment the place detail configuration information with a flag indicating
    // whether or not the logged-in user has admin rights on each category's dataset
    determineAdminStatus: function() {
      _.each(this.options.placeConfig.place_detail, function(place) {
        _.extend(place, {isAdmin: Util.getAdminStatus(place.dataset)});
      });
    },
    render: function(isCategorySelected) {
      var self = this,
      placesToIncludeOnForm = _.filter(this.placeDetail, function(place) { 
        return place.includeOnForm; 
      });

      // if there is only one place to include on form, skip category selection page
      if (placesToIncludeOnForm.length === 1) {
        this.formState.isSingleCategory = true;
        isCategorySelected = true;
        this.formState.selectedCategoryConfig = placesToIncludeOnForm[0];
      }
      
      this.checkAutocomplete();

      var data = _.extend({
        isCategorySelected: isCategorySelected,
        placeConfig: this.options.placeConfig,
        selectedCategoryConfig: this.formState.selectedCategoryConfig,
        user_token: this.options.userToken,
        current_user: Shareabouts.currentUser,
        isSingleCategory: this.formState.isSingleCategory
      }, Shareabouts.stickyFieldValues);

      this.$el.html(Handlebars.templates['place-form'](data));

      if (this.geometryEnabled) {
        this.options.appView.hideCenterPoint();
        this.options.appView.hideSpotlightMask();
        this.geometryEditorView.render({
          $el: this.$el,
          iconUrl: this.formState.selectedCategoryConfig.icon_url
        });
      } else {

        // if the user switches from a geometry-enabled category
        // to a geometry non-enabled category, remove draw controls
        this.geometryEditorView.tearDown();
        this.options.appView.showNewPin();
      }

      if (this.center) $(".drag-marker-instructions").addClass("is-visuallyhidden");

      this.$(".rich-text-field").each(function() {
        new RichTextEditorView({
          el: $(this).get(0),
          model: this.model,
          placeFormView: self,
          fieldName: $(this).attr("name"),
          fieldId: $(this).attr("id")
        });
      });
      
      $('#datetimepicker').datetimepicker({ formatTime: 'g:i a' });

      this.geocodeAddressPlaceView = (new GeocodeAddressPlaceView({
        el: '#geocode-address-place-bar',
        router: this.options.router,
        mapConfig: this.options.mapConfig
      })).render();

      return this;
    },
    // called from the app view
    postRender: function() {
      this.bindCategoryListeners();
    },
    bindCategoryListeners: function() {
      $(".category-btn-container").off().on("click", function(evt) {
        $(this).prev().trigger("click");
      });
    },
    checkAutocomplete: function() {
      _.each(this.formState.selectedCategoryConfig.fields, function(field, i) { 
          _.extend(this.formState.selectedCategoryConfig.fields[i],
            Util.prepField(field, (field.autocomplete) ? 
              Util.getAutocompleteValue(field.name) :
              null));

          this.formState.selectedCategoryConfig.fields[i].isAutocomplete = 
            (field.hasValue && field.autocomplete) ? true : false;
      }, this);

      this.formState.commonFormElements.forEach(function(field, i) {
        _.extend(this.formState.commonFormElements[i],
            Util.prepField(field, (field.autocomplete) ? 
              Util.getAutocompleteValue(field.name) :
              null));

          this.formState.commonFormElements[i].isAutocomplete = 
            (field.hasValue && field.autocomplete) ? true : false;
      }, this);
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
      // set the form to display at larger size after initial map drag
      if (!this.options.appView.hasBodyClass("content-expanded-mid") &&
          this.options.appView.hasBodyClass("place-form-visible")) {      
        this.options.appView.setBodyClass("content-visible", "content-expanded-mid");
        this.options.appView.mapView.map.invalidateSize({ animate:true, pan:true });
      }

      this.center = latLng;
      this.$('.drag-marker-instructions, .drag-marker-warning').addClass('is-visuallyhidden');
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
    onCategoryChange: function(evt) {
      var self = this,
          animationDelay = 200;

      this.formState.selectedCategoryConfig = _.find(this.placeDetail, function(place) {
        return place.category == $(evt.target).attr('id');
      });

      if (_.find(this.formState.selectedCategoryConfig.fields, function(field) {
        return field.type === "geometryToolbar";
      })) {
        this.geometryEnabled = true;
      } else {
        this.geometryEnabled = false;
      }

      this.render(true);
      $("#" + $(evt.target).attr("id"))
        .prop("checked", true)
        .next()
        .addClass("category-btn-container-selected");
      $("#selected-category").hide().show(animationDelay);
      $("#category-btns").animate( { height: "hide" }, animationDelay );
      if (this.center) {
        this.$('.drag-marker-instructions, .drag-marker-warning').addClass('is-visuallyhidden');
      }
    },
    onExpandCategories: function(evt) {
      var animationDelay = 200;
      $("#selected-category").hide(animationDelay);
      $("#category-btns").animate( { height: "show" }, animationDelay ); 
      this.bindCategoryListeners();
    },
    onClickGeolocate: function(evt) {
      var self = this;
      evt.preventDefault();
      var ll = this.options.appView.mapView.map.getBounds().toBBoxString();
      Util.log('USER', 'map', 'geolocate', ll, this.options.appView.mapView.map.getZoom());
      $("#drag-marker-content").addClass("is-visuallyhidden");
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

      if(evt.target.files && evt.target.files.length) {
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
      var self = this,
      targetButton = $(evt.target).attr("id"),
      oldValue = $(evt.target).val(),

      selectedCategoryConfig = _.find(this.formState.placeDetail, function(categoryConfig) { return categoryConfig.category === self.formState.selectedCategory; }),
      altData = _.find(selectedCategoryConfig.fields.concat(self.formState.commonFormElements), function(item) { return item.name === targetButton; }),
      altContent = _.find(altData.content, function(item) { return item.value != oldValue; });

      // set new value and label
      $(evt.target).val(altContent.value);
      $(evt.target).next("label").html(altContent.label);
    },
    closePanel: function() {
      this.center = null;
      this.resetFormState();
    },

    // This function handles submission of data from conventional places with 
    // map drag-based point geometry only
    onSimpleSubmit: function() {
      if (!this.center) {
        this.rejectSubmit(".drag-marker-warning");
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
        this.rejectSubmit(".no-geometry-warning");
        return false;
      }

      // Save any geometry edits made that the use might not have explicitly 
      // saved herself
      this.geometryEditorView.saveWorkingGeometry();

      var attrs = this.getAttrs();

      // Add a style object if we have anything other than point geometry
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

    rejectSubmit: function(warningClass) {
      self.$(".drag-marker-instructions").addClass("is-visuallyhidden");
      self.$(warningClass).removeClass("is-visuallyhidden");
      self.$el.parent("article").scrollTop(0);
      window.scrollTo(0, 0);
    },

    onSubmit: Gatekeeper.onValidSubmit(function(evt) {
      var self = this,
          attrs,
          spinner,
          $fileInputs,
          model,
          router = this.options.router,
          collection = this.collection[self.formState.selectedCategoryConfig.dataset],
          $button = this.$('[name="save-place-btn"]');
      
      evt.preventDefault();

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
        // multiple attachments may be added via Quill...
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
            router.navigate('/'+ model.get('datasetSlug') + '/' + model.id, {trigger: true});
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
    })
  });
