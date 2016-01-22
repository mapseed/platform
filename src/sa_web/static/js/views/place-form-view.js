/*globals _ Spinner Handlebars Backbone jQuery Gatekeeper */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceFormView = Backbone.View.extend({
    // we have a dummy selected category id so the jQuery :not expression below won't throw an error
    selected_category_id: "temp",
    // View responsible for the form for adding and editing places.
    events: {
      'submit form': 'onSubmit',
      'change input[type="file"]': 'onInputFileChange',
      'click .category-change-btn': 'onCategoryChange',
      'click .report-type-btn': 'onReportTypeChange'
    },
    initialize: function(){
      S.TemplateHelpers.overridePlaceTypeConfig(this.options.placeConfig.items,
        this.options.defaultPlaceTypeName);
      S.TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);

      // Bind model events
      this.model.on('error', this.onError, this);
    },
    render: function(category){
      // Augment the model data with place types for the drop down
      //
      //  This is a little hacky--I need to find a better way to extend the template helpers
      //  One option is to stop relying on them entirely and just use registered Handlebar helper functions
      if (category != undefined) {
        S.TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.categories[category].fields);
      }
      ///////////
      
      var data = _.extend({
        place_config: this.options.placeConfig,
        // when category is defined, the selected_category property will contain config file details for fields in the given category
        selected_category: this.options.placeConfig.categories[category] || null,
        user_token: this.options.userToken,
        current_user: S.currentUser,
        category_selected: category_selected || false
      }, S.stickyFieldValues, this.model.toJSON());

      this.$el.html(Handlebars.templates['place-form'](data));
      $("#common-form-elements").css("display", "block");
      return this;
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
    // Get the attributes from the form
    getAttrs: function() {
      var attrs = {},
          locationAttr = this.options.placeConfig.location_item_name,
          $form = this.$('form');

      // Get values from the form
      attrs = S.Util.getAttrs($form);

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
      this.selected_category_id = evt.target.id;
      this.render(evt.target.name.split("-")[2]);
    },
    onReportTypeChange: function(evt) {
      // highlight selected report type button
      $("#" + evt.target.id).addClass("btn-secondary-selected");
      // un-highlight the others
      $(".report-type-btn:not(#" + evt.target.id + ")").removeClass("btn-secondary-selected");
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
    onSubmit: Gatekeeper.onValidSubmit(function(evt) {
      console.log(S.Config.placeTypes);
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

      var router = this.options.router,
          model = this.model,
          // Should not include any files
          attrs = this.getAttrs(),
          $button = this.$('[name="save-place-btn"]'),
          spinner, $fileInputs;

      model.attributes["from_dynamic_form"] = true;
      console.log(model);
      evt.preventDefault();

      $button.attr('disabled', 'disabled');
      spinner = new Spinner(S.smallSpinnerOptions).spin(this.$('.form-spinner')[0]);

      S.Util.log('USER', 'new-place', 'submit-place-btn-click');

      S.Util.setStickyFields(attrs, S.Config.survey.items, S.Config.place.items);

      // Save and redirect
      this.model.save(attrs, {
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
        },
        wait: true
      });
    })
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));
