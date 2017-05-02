  var Util = require('../utils.js');

  var TemplateHelpers = require('../template-helpers.js');

  module.exports = Backbone.View.extend({
    events: {
      'submit form': 'onSubmit',
      'click .reply-link': 'onReplyClick',
      'click .update-response-btn': 'onUpdateResponse',
      'click .delete-response-btn': 'onDeleteResponse'
    },
    initialize: function() {
      TemplateHelpers.insertInputTypeFlags(this.options.surveyConfig.items);

      this.collection.on('reset', this.onChange, this);
      this.collection.on('add', this.onChange, this);

      this.updateSubmissionStatus();
    },

    getSubmissionStatus: function(userToken) {
      return this.collection.find(function(model) {
        return model.get('user_token') === userToken;
      });
    },

    updateSubmissionStatus: function() {
      this.userSubmission = this.getSubmissionStatus(this.options.userToken);
    },

    render: function() {
      var self = this,
          responses = [],
          url = window.location.toString(),
          urlParts = url.split('response/'),
          layout = Util.getPageLayout(),
          responseIdToScrollTo, $responseToScrollTo, data;

      // get the response id from the url
      if (urlParts.length === 2) {
        responseIdToScrollTo = urlParts[1];
      }

      // I don't understand why we need to redelegate the event here, but they
      // are definitely unbound after the first render.
      this.delegateEvents();

      // Responses should be an array of objects with submitter_name,
      // pretty_created_datetime, and items (name, label, and prompt)
      this.collection.each(function(model, i) {
        var items = TemplateHelpers.getItemsFromModel(self.options.surveyConfig.items, model, ['submitter_name']);

        responses.push(_.extend(model.toJSON(), {
          submitter_name: model.get('submitter_name') || self.options.surveyConfig.anonymous_name,
          cid: model.cid,
          pretty_created_datetime: Util.getPrettyDateTime(model.get('created_datetime'),
            self.options.surveyConfig.pretty_datetime_format),
          items: items
        }));
      });

      data = _.extend({
        responses: responses,
        has_single_response: (responses.length === 1),
        user_token: this.options.userToken,
        user_submitted: !!this.userSubmission,
        survey_config: this.options.surveyConfig,
        isEditingToggled: this.options.placeDetailView.isEditingToggled
      }, Shareabouts.stickyFieldValues);

      this.$el.html(Handlebars.templates['place-detail-survey'](data));

      // get the element based on the id
      $responseToScrollTo = this.$el.find('[data-response-id="'+ responseIdToScrollTo +'"]');

      // call scrollIntoView()
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

      if (this.options.placeDetailView.isEditingToggled) {
        var editEvents = "keyup";
        $.each(this.$el.find(".responses form"), function() {
          $(this).on(editEvents, function(e) {
            if ((e.keyCode >= 48 && e.keyCode <= 57) // 0-9 (also shift symbols)
              || (e.keyCode >= 65 && e.keyCode <= 90) // a-z (also capital letters)
              || (e.keyCode === 8) // backspace key
              || (e.keyCode === 46) // delete key
              || (e.keyCode === 32) // spacebar
              || (e.keyCode >= 186 && e.keyCode <= 222)) { // punctuation
              $(this).siblings(".btn-update").removeClass("faded").prop("disabled", false);
            }
          });
        });
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
          attrs = Util.getAttrs($form),
          spinner;

      // Disable the submit button until we're done, so that the user doesn't
      // over-click it
      $button.attr('disabled', 'disabled');
      spinner = new Spinner(Shareabouts.smallSpinnerOptions).spin(this.$('.form-spinner')[0]);

      Util.log('USER', 'place', 'submit-reply-btn-click', this.collection.options.placeModel.getLoggingDetails(), this.collection.size());

      Util.setStickyFields(attrs, Shareabouts.Config.survey.items, Shareabouts.Config.place.items);

      // Create a model with the attributes from the form
      this.collection.create(attrs, {
        wait: true,
        success: function() {
          // Clear the form
          $form.get(0).reset();
          Util.log('USER', 'place', 'successfully-reply', self.collection.options.placeModel.getLoggingDetails());
        },
        error: function() {
          Util.log('USER', 'place', 'fail-to-reply', self.collection.options.placeModel.getLoggingDetails());
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
      Util.log('USER', 'place', 'leave-reply-btn-click', this.collection.options.placeModel.getLoggingDetails(), this.collection.size());
    },

    onUpdateResponse: function(evt) {
      var cid = $(evt.target).parent().data("cid"),
      model = this.collection.get(cid),
      $form = $(evt.target).siblings("form"),
      attrs = Util.getAttrs($form);
      model.set(attrs).save({}, {
        success: function() {
          $(evt.target).addClass("faded").prop("disabled", true);
        }
      });
    },

    onDeleteResponse: function(evt) {
      var response = confirm("You are deleting this comment permanently. Are you sure you want to continue?");
      if (response) {
        var cid = $(evt.target).parent().data("cid"),
        model = this.collection.get(cid);
        model.destroy();
        this.render();
      }
    }
  });
