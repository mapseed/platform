/*globals _ Spinner Handlebars Backbone jQuery Gatekeeper */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceFormView = Backbone.View.extend({
    events: {
      'submit form': 'onSubmit',
      'change input[type="file"]': 'onInputFileChange',
      'click .category-btn.clickable + label': 'onCategoryChange',
      'click .category-menu-hamburger': 'onExpandCategories',
      'click input[data-input-type="binary_toggle"]': 'onBinaryToggle',
      'click .btn-geolocate': 'onClickGeolocate'
    },
    initialize: function(){
      var self = this;
       
      this.resetFormState();

      S.TemplateHelpers.overridePlaceTypeConfig(this.options.placeConfig.items,
        this.options.defaultPlaceTypeName);
      S.TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);
    },
    resetFormState: function() {
      this.formState = {
        selectedCategory: null,
        selectedDatasetId: null,
        selectedDatasetSlug: null,
        isSingleCategory: false,
        attachmentData: null,
        placeDetail: this.options.placeConfig.place_detail
      }
    },
    render: function(category, isCategorySelected) {
      var self = this,
      selectedCategoryConfig = category && _.find(self.formState.placeDetail, function(categoryConfig) { return categoryConfig.category === category; }) || {},
      placesToIncludeOnForm = _.filter(self.formState.placeDetail, function(categoryConfig) { return categoryConfig.includeOnForm; });

      // if there is only one place to include on form, skip category selection page
      if (placesToIncludeOnForm.length === 1) {
        this.formState.isSingleCategory = true;
        isCategorySelected = true;
        category = placesToIncludeOnForm[0].category;
        this.formState.selectedCategory = category;
        this.formState.selectedDatasetId = placesToIncludeOnForm[0].dataset;
        this.formState.selectedDatasetSlug = _.find(this.options.mapConfig.layers, function(layer) { return self.formState.selectedDatasetId == layer.id }).slug;
        selectedCategoryConfig = placesToIncludeOnForm[0];
      }

      var data = _.extend({
        isCategorySelected: isCategorySelected,
        placeConfig: this.options.placeConfig,
        selectedCategory: selectedCategoryConfig,
        user_token: this.options.userToken,
        current_user: S.currentUser,
        isSingleCategory: this.formState.isSingleCategory
      }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['place-form'](data));

      if (this.center) $(".drag-marker-instructions").addClass("is-visuallyhidden");

      return this;
    },
    postRender: function() {
      // if the form only has a single category, hide category selection buttons
      if (this.formState.isSingleCategory) $("#selected-category, #category-btns").addClass("is-visuallyhidden");

      // initialize datetime picker, if relevant
      $('#datetimepicker').datetimepicker({ formatTime: 'g:i a' }); // <-- add to datetimepicker, or could be a handlebars helper?
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
      this.center = latLng;
      this.$('.drag-marker-instructions, .drag-marker-warning').addClass('is-visuallyhidden');
    },
    setLocation: function(location) {
      this.location = location;
    },
    getAttrs: function() {
      var attrs = {},
          locationAttr = this.options.placeConfig.location_item_name,
          $form = this.$('form');

      // Get values from the form
      attrs = S.Util.getAttrs($form);

      // get values off of binary toggle buttons that have not been toggled
      $.each($("input[data-input-type='binary_toggle']:not(:checked)"), function() {
        attrs[$(this).attr("name")] = $(this).val();
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

      this.formState.selectedCategory = $(evt.target).parent().prev().attr('id');
      this.formState.selectedDatasetId = _.find(self.formState.placeDetail, function(categoryConfig) { return categoryConfig.category === self.formState.selectedCategory }).dataset;
      this.formState.selectedDatasetSlug = _.filter(this.options.mapConfig.layers, function(layer) { return layer.id === self.formState.selectedDatasetId })[0].slug;

      // re-render the form with the selected category
      this.render(this.formState.selectedCategory, true);
      // manually set the category button again since the re-render resets it
      $(evt.target).parent().prev().prop("checked", true);
      // hide and then show (with animation delay) the selected category button 
      // so we don't see a duplicate selected category button briefly
      $("#selected-category").hide().show(animationDelay);
      // slide up unused category buttons
      $("#category-btns").animate( { height: "hide" }, animationDelay );
      // if we've already dragged the map, make sure the map drag instructions don't reappear
      if (this.center) this.$('.drag-marker-instructions, .drag-marker-warning').addClass('is-visuallyhidden');
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
          $("#spotlight-place-mask").remove();
          self.render();
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
      // find the matching config data for this element
      selectedCategoryConfig = _.find(this.formState.placeDetail, function(categoryConfig) { return categoryConfig.category === self.formState.selectedCategory; }),
      altData = _.find(selectedCategoryConfig.fields, function(item) { return item.name === targetButton; }),
      // fetch alternate label and value
      altContent = _.find(altData.content, function(item) { return item.value != oldValue; });

      // set new value and label
      $(evt.target).val(altContent.value);
      $(evt.target).next("label").html(altContent.label);
    },
    closePanel: function() {
      this.center = null;
      this.resetFormState();
    },
    onExpandCategories: function(evt) {
      var animationDelay = 400;
      $("#selected-category").hide(animationDelay);
      $("#category-btns").animate( { height: "show" }, animationDelay ); 
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
          spinner, $fileInputs;
      evt.preventDefault();

      collection.add({"location_type": this.formState.selectedCategory});
      model = collection.at(collection.length - 1);

      model.set("datasetSlug", self.formState.selectedDatasetSlug);
      model.set("datasetId", self.formState.selectedDatasetId);
      
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
}(Shareabouts, jQuery, Shareabouts.Util.console));
