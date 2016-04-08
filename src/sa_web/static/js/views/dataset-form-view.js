/*globals _ Spinner Handlebars Backbone jQuery Gatekeeper */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.DatasetFormView = S.PlaceFormView.extend({
    events: {
      'submit form': 'onSubmit',
      'change input[type="file"]': 'onInputFileChange',
      'click .category-btn-label-clickable': 'onCategoryChange',
      'click .category-menu-hamburger': 'onExpandCategories',
      'click input[data-input-type="binary_toggle"]': 'onBinaryToggle'
    },
    initialize: function(){
      var self = this;
      // keep track of relevant catgory & dataset info as user switches among categories
      this.selectedCategory = null;
      this.selectedDatasetId = null;
      this.priorDatasetId = null;
      this.selectedDatasetSlug = null;
      this.priorModelCid = null;
      S.TemplateHelpers.overridePlaceTypeConfig(this.options.placeConfig.items,
        this.options.defaultPlaceTypeName);
      S.TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);

      // attach collection listeners
      for (var collection in this.collection) {
        this.collection[collection].on('add', self.setModel, this);
      }
    },
    render: function(category, category_selected){
      // Augment the model data with place types for the drop down

      if (category != undefined) {
        S.TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.categories[category].fields);
      }

      var data = _.extend({
        place_config: this.options.placeConfig,
        selected_category: this.options.placeConfig.categories[category],
        category_selected: category_selected || false,
        user_token: this.options.userToken,
        current_user: S.currentUser
      }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['dataset-form'](data));

      // initialize datetime picker, if relevant
      $('#datetimepicker').datetimepicker({ formatTime: 'g:i a' });

      return this;
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
      this.selectedDatasetId = this.options.placeConfig.categories[this.selectedCategory].dataset,
      this.selectedDatasetSlug = this.options.placeConfig.categories[this.selectedCategory].datasetSlug;

      // re-render the form with the selected category
      this.render(this.selectedCategory, true);
      // manually set the category button again since the re-render resets it
      $(evt.target).parent().prev().prop("checked", true);
      // hide and then show (with animation delay) the selected category button 
      // so we don't see a duplicate selected category button briefly
      $("#selected-category").hide().show(animationDelay);
      // slide up unused category buttons
      $("#category-btns").animate( { height: "hide" }, animationDelay );

      // instantiate appropriate backbone model
      this.collection[self.selectedDatasetId].add({});
    },
    onBinaryToggle: function(evt) {
      var targetButton = $(evt.target).attr("id"),
          oldValue = $(evt.target).val(),
          // find the match config data for this element
          altData = _.filter(this.options.placeConfig.categories[this.selectedCategory].fields, function(item) {
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

      model.attributes["from_dynamic_form"] = true;
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

          // add the newly-created model to the mergedCollection,
          // for use on the place list view
          self.options.appView.mergedCollection.add(model);

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
