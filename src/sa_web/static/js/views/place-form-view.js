/*globals _ Spinner Handlebars Backbone jQuery Gatekeeper */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceFormView = Backbone.View.extend({
    events: {
      'submit form': 'onSubmit',
      'change input[type="file"]': 'onInputFileChange',
      'click .category-btn.clickable + label': 'onCategoryChange',
      'click .category-menu-hamburger': 'onExpandCategories',
      'click input[data-input-type="binary_toggle"]': 'onBinaryToggle'
    },
    initialize: function(){
      var self = this;
      this.mapDragged = false;
      // keep track of relevant catgory & dataset info as user switches among categories
      this.selectedCategory = null;
      this.selectedDatasetId = null;
      this.priorDatasetId = null;
      this.selectedDatasetSlug = null;
      this.priorModelCid = null;
      this.singleCategory = false;
      S.TemplateHelpers.overridePlaceTypeConfig(this.options.placeConfig.items,
        this.options.defaultPlaceTypeName);
      S.TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);

      // attach collection listeners
      for (var collection in this.collection) {
        this.collection[collection].on('add', self.setModel, this);
      }
    },
    render: function(category, is_category_selected) {
      var self = this;
      var selectedCategoryConfig = category && this.options.placeConfig.place_detail[category] || {};
      var placesToIncludeOnForm = _.filter(_.keys(self.options.placeConfig.place_detail), function(key) { return self.options.placeConfig.place_detail[key].includeOnForm; });       

      // if there is only one place to include on form, skip category selection page
      if (placesToIncludeOnForm.length == 1) {
        is_category_selected = true;
        this.singleCategory = true;
        category = placesToIncludeOnForm[0];
        this.selectedCategory = category;
        this.selectedDatasetId = this.options.placeConfig.place_detail[this.selectedCategory].dataset;
        this.selectedDatasetSlug = this.options.placeConfig.place_detail[this.selectedCategory].datasetSlug;
        selectedCategoryConfig = this.options.placeConfig.place_detail[category];
        this.collection[this.selectedDatasetId].add({});
      }

      var data = _.extend({
        place_config: this.options.placeConfig,
        selected_category: selectedCategoryConfig,
        is_category_selected: is_category_selected || false,
        user_token: this.options.userToken,
        current_user: S.currentUser,
        is_single_category: (placesToIncludeOnForm.length == 1) ? true : false
      }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['place-form'](data));

      return this;
    },
    postRender: function() {
      // if the form only has a single category, hide category selection buttons
      if (this.singleCategory) $("#selected-category, #category-btns").addClass("is-visuallyhidden");

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
      this.mapDragged = true;
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

      this.selectedCategory = $(evt.target).parent().prev().attr('id'),
      this.selectedDatasetId = this.options.placeConfig.place_detail[this.selectedCategory].dataset,
      this.selectedDatasetSlug = this.options.placeConfig.place_detail[this.selectedCategory].datasetSlug;

      // re-render the form with the selected category
      this.render(this.selectedCategory, true);
      // manually set the category button again since the re-render resets it
      $(evt.target).parent().prev().prop("checked", true);
      // hide and then show (with animation delay) the selected category button 
      // so we don't see a duplicate selected category button briefly
      $("#selected-category").hide().show(animationDelay);
      // slide up unused category buttons
      $("#category-btns").animate( { height: "hide" }, animationDelay );
      // if we've already dragged the map, make sure the map drag instructions don't reappear
      if (this.mapDragged) this.$('.drag-marker-instructions, .drag-marker-warning').addClass('is-visuallyhidden');

      // instantiate appropriate backbone model
      this.collection[self.selectedDatasetId].add({});
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
            var fieldName = $(evt.target).attr('name'),
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
    onBinaryToggle: function(evt) {
      var targetButton = $(evt.target).attr("id"),
          oldValue = $(evt.target).val(),
          // find the match config data for this element
          altData = _.filter(this.options.placeConfig.place_detail[this.selectedCategory].fields, function(item) {
            return item.name == targetButton;
          })[0];
          // fetch alternate label and value
          altContent = _.filter(altData.content, function(item) {
            return item.value != oldValue;
          })[0];

      // set new value and label
      $(evt.target).val(altContent.value);
      $(evt.target).next("label").html(altContent.label);
    },
    setModel: function(model) {
      var self = this;
      this.model = model;

      if (this.priorModelCid && this.priorDatasetId) {
        this.collection[self.priorDatasetId].get({ cid: self.priorModelCid }).destroy();
      }
      this.priorModelCid = model.cid;
      this.priorDatasetId = this.selectedDatasetId;
    },
    closePanel: function() {
      // make sure we reset priorModelCid and priorDatasetId if the user closes the side panel
      this.priorModelCid = null;
      this.priorDatasetId = null;
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
          model = this.model,
          // Should not include any files
          attrs = this.getAttrs(),
          categoryId = $(evt.target),
          $button = this.$('[name="save-place-btn"]'),
          spinner, $fileInputs;

      model.attributes["datasetSlug"] = this.selectedDatasetSlug;
      model.attributes["datasetId"] = this.selectedDatasetId;
      evt.preventDefault();

      $button.attr('disabled', 'disabled');
      spinner = new Spinner(S.smallSpinnerOptions).spin(this.$('.form-spinner')[0]);

      S.Util.log('USER', 'new-place', 'submit-place-btn-click');

      S.Util.setStickyFields(attrs, S.Config.survey.items, S.Config.place.items);

      // Save and redirect
      this.model.save(attrs, {
        success: function() {
          S.Util.log('USER', 'new-place', 'successfully-add-place');

          // add the newly-created model to mergedPlaces,
          // for use on the place list view
          self.options.appView.mergedPlaces.add(model);

          router.navigate('/'+ model.get('datasetSlug') + '/' + model.id, {trigger: true});
        },
        error: function() {
          S.Util.log('USER', 'new-place', 'fail-to-add-place');
        },
        complete: function() {
          $button.removeAttr('disabled');
          spinner.stop();
        },
        wait: true
      });
    })
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
