/*globals _ Spinner Handlebars Backbone jQuery Gatekeeper */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.SuperPlaceFormView = Backbone.PlaceFormView.extend({
    // View responsible for the form for adding and editing places.
    events: {
      'render question form': 'renderQuestionForm',
      'render place form': 'renderPlaceForm'
    },
    initialize: function(){
      S.TemplateHelpers.overridePlaceTypeConfig(this.options.placeConfig.items,
        this.options.defaultPlaceTypeName);
      S.TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);

      // Bind model events
      this.model.on('error', this.onError, this);
    },
    renderQuestionForm: function(){
      // Augment the model data with place types for the drop down
      var data = _.extend({
        place_config: this.options.placeConfig,
        user_token: this.options.userToken,
        current_user: S.currentUser
      }, S.stickyFieldValues, this.model.toJSON());

      this.$el.html(Handlebars.templates['question-form'](data));
      return this;
    },
    renderPlaceForm: function(){
      // Augment the model data with place types for the drop down
      var data = _.extend({
        place_config: this.options.placeConfig,
        user_token: this.options.userToken,
        current_user: S.currentUser
      }, S.stickyFieldValues, this.model.toJSON());

      this.$el.html(Handlebars.templates['place-form'](data));
      return this;
    }
  })
})
