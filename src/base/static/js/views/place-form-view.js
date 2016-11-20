  var Util = require('../utils.js');

  var TemplateHelpers = require('../template-helpers.js');

  module.exports = Backbone.View.extend({
    events: {
      'submit form': 'onSubmit',
      'change input[type="file"]': 'onInputFileChange',
      'click .category-btn.clickable': 'onCategoryChange',
      'click .category-menu-hamburger': 'onExpandCategories',
      'click input[data-input-type="binary_toggle"]': 'onBinaryToggle',
      'click .btn-geolocate': 'onClickGeolocate'
    },
    initialize: function(){
      var self = this;
      this.resetFormState();
      this.placeDetail = this.options.placeConfig.place_detail;

      TemplateHelpers.overridePlaceTypeConfig(this.options.placeConfig.items,
        this.options.defaultPlaceTypeName);
      TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);
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

      if (Shareabouts.bootstrapped.currentUser &&
        _.contains(this.options.placeConfig.administrators, Shareabouts.bootstrapped.currentUser.username)) {
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
        current_user: Shareabouts.currentUser,
        isSingleCategory: this.formState.isSingleCategory
      }, Shareabouts.stickyFieldValues);

      if (data.selectedCategory.fields) {
        data = this.checkAutocomplete(data);
      }

      this.$el.html(Handlebars.templates['place-form'](data));

      if (this.center) $(".drag-marker-instructions").addClass("is-visuallyhidden");

      return this;
    },
    // called from the app view
    postRender: function() {
      var self = this,
      $prompt;

      $('#datetimepicker').datetimepicker({ formatTime: 'g:i a' });
      if ($(".rawHTML").length > 0) {
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
            _.find(self.formState.placeDetail, function(categoryConfig) { 
              return categoryConfig.category === self.formState.selectedCategory
            }).fields, function(categoryField) {
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
        storedValue = Util.getAutocompleteValue(field.name);
        self.formState.selectedCategoryConfig.fields[i].autocompleteValue = storedValue || null;
      });
      this.formState.commonFormElements.forEach(function(field, i) {
        storedValue = Util.getAutocompleteValue(field.name);
        self.formState.commonFormElements[i].autocompleteValue = storedValue || null;
      });
    },
    checkAutocomplete: function(data) {
      var cookiePrefix = "mapseed-",
      cookies = {};
      _.each(document.cookie.split(";"), function(cookie) {
          cookie = cookie.split("=");
          if ($.trim(cookie[0]).startsWith(cookiePrefix)) {
            cookies[$.trim(cookie[0]).replace(cookiePrefix, "")] = cookie[1].split(",");
          }
      });
      data.selectedCategory.fields.forEach(function(field, i) {
        data.selectedCategory.fields[i].autocompleteValue = 
          (cookies[field.name] && cookies[field.name].length == 1) ? cookies[field.name][0] : cookies[field.name];
      });
      return data;
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
          $form = this.$('form');

      // Get values from the form
      attrs = S.Util.getAttrs($form, _.find(this.formState.placeDetail, function(categoryConfig) { return categoryConfig.category === self.formState.selectedCategory; }));

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
          Util.saveAutocompleteValue(key, value, 30);
        }
      });
        
      // Get the location attributes from the map
      attrs.geometry = {
        type: 'Point',
        coordinates: [this.center.lng, this.center.lat]
      };

      if (this.location && locationAttr) {
        attrs[locationAttr] = this.location;
      }

      return attrs;
    },
    onCategoryChange: function(evt) {
      var self = this,
          animationDelay = 400;

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
      if (this.center) this.$('.drag-marker-instructions, .drag-marker-warning').addClass('is-visuallyhidden');
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
      altData = _.find(this.formState.selectedCategoryConfig.fields
        .concat(self.formState.commonFormElements), function(item) { 
          return item.name === targetButton; 
        }),
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
      // Make sure that the center point has been set after the form was
      // rendered. If not, this is a good indication that the user neglected
      // to move the map to set it in the correct location.
      if (!this.center) {
        this.$('.drag-marker-instructions').addClass('is-visuallyhidden');
        this.$('.drag-marker-warning').removeClass('is-visuallyhidden');

        // Scroll to the top of the panel if desktop
        this.$el.parent('article').scrollTop(0);
        // Scroll to the top of the window, if mobile
        window.scrollTo(0, 0);
        return;
      }

      var self = this,
        router = this.options.router,
        collection = this.collection[self.formState.selectedDatasetId],
        model,
        // Should not include any files
        attrs = this.getAttrs(),
        $button = this.$('[name="save-place-btn"]'),
        spinner, $fileInputs,
        richTextAttrs = {};

      // if we have a Quill-enabled field, assume content from this field belongs
      // to the description field. We'll need to make this behavior more sophisticated
      // to support multiple Quill-enabled fields.
      if ($(".ql-editor").html()) {
        richTextAttrs.description = $(".ql-editor").html();
      }
      attrs = _.extend(attrs, richTextAttrs);

      console.log("attrs", attrs);

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
          $button.removeAttr('disabled');
          spinner.stop();
          self.resetFormState();
        },
        wait: true
      });
    })
  });
