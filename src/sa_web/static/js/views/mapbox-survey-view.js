/*globals jQuery Backbone _ Handlebars Spinner Gatekeeper */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.MapboxSurveyView = Backbone.View.extend({
    initialize: function() {
    },

    render: function() {
      var self = this,
          responses = [{ id: 'test-id' }],
          url = window.location.toString(),
          urlParts = url.split('response/'),
          layout = S.Util.getPageLayout(),
          responseIdToScrollTo, $responseToScrollTo, data;

      data = _.extend({
        responses: responses,
        has_single_response: true,
        user_submitted: !!this.userSubmission,
        survey_config: { "show_responses": true, "response_name": "test response name" }
      }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['mapbox-detail-survey'](data));

      // get the element based on the id
      $responseToScrollTo = this.$el.find('[data-response-id="'+ responseIdToScrollTo +'"]');

      if ($responseToScrollTo.length > 0) {
        setTimeout(function() {
          // For desktop, the panel content is scrollable
          if (layout === 'desktop') {
            $('#content article').scrollTo($responseToScrollTo);
          } else {
            // For mobile, it's the window
            $(window).scrollTo($responseToScrollTo);
          }
        }, 700);
      }
      return this;
    },

    remove: function() {
      this.unbind();
      this.$el.remove();
    },

    onChange: function() {
      this.updateSubmissionStatus();
      this.render();
    },

    onSubmit: Gatekeeper.onValidSubmit(function(evt) {
      evt.preventDefault();
      var self = this,
          $form = this.$('form'),
          $button = this.$('[name="commit"]'),
          attrs = S.Util.getAttrs($form),
          spinner;

      // Disable the submit button until we're done, so that the user doesn't
      // over-click it
      $button.attr('disabled', 'disabled');
      spinner = new Spinner(S.smallSpinnerOptions).spin(this.$('.form-spinner')[0]);

      S.Util.log('USER', 'place', 'submit-reply-btn-click', this.collection.options.placeModel.getLoggingDetails(), this.collection.size());

      S.Util.setStickyFields(attrs, S.Config.survey.items, S.Config.place.items);

      // Create a model with the attributes from the form
      this.collection.create(attrs, {
        wait: true,
        success: function() {
          // Clear the form
          $form.get(0).reset();
          S.Util.log('USER', 'place', 'successfully-reply', self.collection.options.placeModel.getLoggingDetails());
        },
        error: function() {
          S.Util.log('USER', 'place', 'fail-to-reply', self.collection.options.placeModel.getLoggingDetails());
        },
        complete: function() {
          // No matter what, enable the button
          $button.removeAttr('disabled');
          spinner.stop();
        }
      });
    }),

    onReplyClick: function(evt) {
      evt.preventDefault();
      this.$('textarea, input').not('[type="hidden"]').first().focus();
      S.Util.log('USER', 'place', 'leave-reply-btn-click', this.collection.options.placeModel.getLoggingDetails(), this.collection.size());
    }
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
