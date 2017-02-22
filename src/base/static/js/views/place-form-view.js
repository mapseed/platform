/*globals _ Spinner Handlebars Backbone jQuery Gatekeeper Quill */

var Shareabouts = Shareabouts || {};

(function(S, $, console, Quill){
  S.PlaceFormView = Backbone.View.extend({
    events: {
      'submit form': 'onSubmit',
      'change input[type="file"]': 'onInputFileChange',
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

      S.TemplateHelpers.overridePlaceTypeConfig(this.options.placeConfig.items,
        this.options.defaultPlaceTypeName);
      S.TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);
    },
    resetFormState: function() {
      this.formState = {
        selectedCategoryConfig: {
          fields: []
        },
        isSingleCategory: false,
        attachmentData: null,
        commonFormElements: this.options.placeConfig.common_form_elements || {}
      }
    },
    render: function(isCategorySelected) {
      var isAdmin = false,
      self = this,
      placesToIncludeOnForm = _.filter(this.placeDetail, function(place) { 
        return place.includeOnForm; 
      });

      if (S.bootstrapped.currentUser &&
        _.contains(this.options.placeConfig.administrators, S.bootstrapped.currentUser.username)) {
        isAdmin = true;
      }

      // if there is only one place to include on form, skip category selection page
      if (placesToIncludeOnForm.length === 1) {
        this.formState.isSingleCategory = true;
        isCategorySelected = true;
        this.formState.selectedCategoryConfig = placesToIncludeOnForm[0];
      }

      this.checkAutocomplete();

      var data = _.extend({
        isCategorySelected: isCategorySelected,
        isAdmin: isAdmin,
        placeConfig: this.options.placeConfig,
        selectedCategoryConfig: this.formState.selectedCategoryConfig,
        user_token: this.options.userToken,
        current_user: S.currentUser,
        isSingleCategory: this.formState.isSingleCategory
      }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['place-form'](data));

      if (this.formState.selectedCategoryConfig.enable_geometry) {
        this.options.appView.hideCenterPoint();
        this.options.appView.hideSpotlightMask();
        this.geometryEditorView.render({
          isCreatingNewGeometry: true
        });
      } else {
        // if the user switches from a geometry-enabled category
        // to a geometry non-enabled category, remove draw controls
        this.geometryEditorView.tearDown();
        this.options.appView.showNewPin();
      }

      if (this.center) $(".drag-marker-instructions").addClass("is-visuallyhidden");

      return this;
    },
    // called from the app view
    postRender: function(isCategorySelected) {
      var self = this,
      $prompt;

      $('#datetimepicker').datetimepicker({ formatTime: 'g:i a' });
      if (isCategorySelected && $(".rawHTML").length > 0) {
        // NOTE: we currently support a single QuillJS field per form
        $prompt = $(".rawHTML").find("label").detach();

        // Quill toolbar configuration
        var toolbarOptions = [
          ["bold", "italic", "underline", "strike"],
          [{ "list": "ordered" }, { "list": "bullet" }],
          [{ "header": [1, 2, 3, 4, 5, 6, false] }],
          [{ "color": [] }, { "background": [] }],
          ["link", "image", "video"]
        ],
        quill = new Quill(".rawHTML", {
          modules: { 
            "toolbar": toolbarOptions
          },
          theme: "snow",
          bounds: "#content",
          placeholder: _.find(
            this.formState.selectedCategoryConfig.fields, function(categoryField) {
              return categoryField.type === "rawHTML"
            }).placeholder
        }),
        toolbar = quill.getModule("toolbar");
        $(".ql-toolbar").before($prompt);
        quill.deleteText(0, 50);

        // override default image upload behavior: instead, create an <img>
        // tag with highlighted text set as the src attribute
        toolbar.addHandler("image", function() {
          var range = quill.getSelection();
          quill.insertEmbed(range.index, "image", quill.getText(range.index, range.length), "user");
        }); 
      }

      this.bindCategoryListeners();
    },
    bindCategoryListeners: function() {
      $(".category-btn-container").off().on("click", function(evt) {
        $(this).prev().trigger("click");
      });
    },
    checkAutocomplete: function() {
      var self = this,
      storedValue;

      this.formState.selectedCategoryConfig.fields.forEach(function(field, i) {
        storedValue = S.Util.getAutocompleteValue(field.name);
        self.formState.selectedCategoryConfig.fields[i].autocompleteValue = storedValue || null;
      });
      this.formState.commonFormElements.forEach(function(field, i) {
        storedValue = S.Util.getAutocompleteValue(field.name);
        self.formState.commonFormElements[i].autocompleteValue = storedValue || null;
      });
    },
    checkAutocomplete: function() {
      var self = this,
      storedValue;

      this.formState.selectedCategoryConfig.fields.forEach(function(field, i) {
        storedValue = S.Util.getAutocompleteValue(field.name);
        self.formState.selectedCategoryConfig.fields[i].autocompleteValue = storedValue || null;
      });
      this.formState.commonFormElements.forEach(function(field, i) {
        storedValue = S.Util.getAutocompleteValue(field.name);
        self.formState.commonFormElements[i].autocompleteValue = storedValue || null;
      });
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
      console.log("getAttrs");

      var self = this,
          attrs = {},
          locationAttr = this.options.placeConfig.location_item_name,
          $form = this.$('form');
      attrs = S.Util.getAttrs($form);

      // get values off of binary toggle buttons that have not been toggled
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
          S.Util.saveAutocompleteValue(key, value, 30);
        }
      });
      
      if (this.formState.selectedCategoryConfig.enable_geometry) {
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
    onClickGeolocate: function(evt) {
      var self = this;
      evt.preventDefault();
      var ll = this.options.appView.mapView.map.getBounds().toBBoxString();
      S.Util.log('USER', 'map', 'geolocate', ll, this.options.appView.mapView.map.getZoom());
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
        S.Util.fileToCanvas(file, function(canvas) {
          canvas.toBlob(function(blob) {
            self.formState.attachmentData = {
              name: $(evt.target).attr('name'),
              blob: blob,
              file: canvas.toDataURL('image/jpeg')
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
    onSubmit: Gatekeeper.onValidSubmit(function(evt) {
      var self = this,
      rejectSubmit = function(warningClass) {
        self.$(".drag-marker-instructions").addClass("is-visuallyhidden");
        self.$(warningClass).removeClass("is-visuallyhidden");
        self.$el.parent("article").scrollTop(0);
        window.scrollTo(0, 0);
      };

      if (this.formState.selectedCategoryConfig.enable_geometry
        && this.geometryEditorView.editingLayerGroup.getLayers().length == 0) {
        // If the map has an editingLayerGroup with no layers in it, it means the
        // user hasn't created any geometry yet
        rejectSubmit(".no-geometry-warning");
        return;
      } else if (!this.center) {
        rejectSubmit(".drag-marker-warning");
        return;
      }

      var self = this,
        router = this.options.router,
        collection = this.collection[self.formState.selectedCategoryConfig.dataset],
        model,
        // Should not include any files
        attrs = this.getAttrs(),
        $button = this.$('[name="save-place-btn"]'),
        spinner, $fileInputs,
        richTextAttrs = {};

      // if we have a Quill-enabled field, assume content from this field belongs
      // to the model's description attribute. We'll need to make this behavior 
      // more sophisticated to support multiple Quill-enabled fields.
      if ($(".ql-editor").html()) {
        richTextAttrs.description = $(".ql-editor").html();
      }
      attrs = _.extend(attrs, richTextAttrs);

      if (this.formState.selectedCategoryConfig.enable_geometry) {
        attrs["style"] = {
          color: this.geometryEditorView.colorpicker.color,
          opacity: this.geometryEditorView.colorpicker.opacity,
          fillColor: this.geometryEditorView.colorpicker.fillColor,
          fillOpacity: this.geometryEditorView.colorpicker.fillOpacity
        }
      }

      evt.preventDefault();

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
      spinner = new Spinner(S.smallSpinnerOptions).spin(self.$('.form-spinner')[0]);

      S.Util.log('USER', 'new-place', 'submit-place-btn-click');

      S.Util.setStickyFields(attrs, S.Config.survey.items, S.Config.place.items);

      // Save and redirect
      model.save(attrs, {
        success: function() {
          if (self.geometryEditorView) {
            self.geometryEditorView.tearDown();
          }
          S.Util.log('USER', 'new-place', 'successfully-add-place');
          router.navigate('/'+ model.get('datasetSlug') + '/' + model.id, {trigger: true});
        },
        error: function() {
          S.Util.log('USER', 'new-place', 'fail-to-add-place');
        },
        complete: function() {
          $button.removeAttr('disabled');
          spinner.stop();
          self.resetFormState();
        },
        wait: true
      });
    })
  });
}(Shareabouts, jQuery, Shareabouts.Util.console, Quill));
