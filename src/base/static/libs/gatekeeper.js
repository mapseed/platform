// 0.1.2

var Util = require('../js/utils.js');

var self = module.exports = {
  registerCollectionsSet: function(collectionsSet) {
    this.collectionsSet = collectionsSet;
  },

  getInvalidFormEls: function(context) {
    var $form = context.$el,
        invalidEls;

    $form.find(".invalid-msg").addClass("hidden");

    invalidEls = $form.find('input, select, textarea').map(function() {
      var $this = $(this),
          $checkableGroup,
          $requiredInputs,
          isCheckbox,
          restoreRequired,
          hasValue;

      $this.removeClass("gatekeeper-invalid");

      // Only validate visible elements
      if ($this.is(':visible')) {

        // For checkbox groups, only one needs to be checked
        isCheckbox = $this.is('[type="checkbox"]');
        if (isCheckbox) {
          $requiredInputs = $form.find('[name="'+$this.attr('name')+'"][required]');
          hasValue = $requiredInputs.is(':checked');
          if (hasValue) {
            $requiredInputs.removeAttr('required');
          }
        }

        restoreRequired = function() {
          if ($requiredInputs) {
            $requiredInputs.attr('required', 'required');
          }
        };

        // Does it support the validity object?
        if (this.validity) {
          // Add it to the array if it's invalid
          if (!this.validity.valid) {
            restoreRequired();
            return this;
          }
        } else {
          $this.removeClass('gatekeeper-invalid');

          if ($this.is('[type="checkbox"]') || $this.is('[type="radio"]')) {
            $checkableGroup = $form.find('[name="'+$this.attr('name')+'"]');
            hasValue = $checkableGroup.is(':checked');
          } else {
            // Strip whitespace from the value
            hasValue = (this.value || '').replace(/\s+/) !== '';
          }

          // Manually support 'required' for old browsers
          if (this.hasAttribute('required') && !hasValue) {
            $this.addClass('gatekeeper-invalid');
            restoreRequired();
            return this;
          }
        }

        // Validate a user-supplied landmark-style url. Validation fails under two
        // conditions:
        // 1. If the supplied url matches any other url in the passed set of collections
        // 2. If the supplied url contains a / character in it
        if ($this.attr("name") === "url-title") {
          var url = Util.prepareCustomUrl($this.val());

          if (url.split("/").length > 1) {
            $this.addClass("gatekeeper-invalid");
            $form.find(".invalid-msg.forward-slash")
              .removeClass("hidden");
            return this; 
          }

          var isValid = true;
          if ($this.val() !== "") {
            _.each(self.collectionsSet, function(collectionSet) {
              _.each(collectionSet, function(collection) {
                var model = collection.findWhere({"url-title": url}),
                    isValidLocal = true;
                
                // NOTE: in edit mode, we want to prevent validation of a model's
                // url-title against itself.
                if (context.model && model && model.cid !== context.model.cid) {
                  isValidLocal = false;
                } else if (!context.model && model) {
                  isValidLocal = false;
                }

                if (!isValidLocal) {
                  $this.addClass("gatekeeper-invalid");
                  isValid = false;
                  $form.find(".invalid-msg.duplicate-url")
                    .removeClass("hidden");
                }
              });
            });
          }

          if (!isValid) {
            return this;
          }
        }
      }
    });

    return invalidEls;
  },

  validate: function(form) {
    // Get invalid elements from the form
    var invalidEls = this.getInvalidFormEls(form);

    // Indicate that this form has been submitted
    $(form).addClass('form-submitted');

    if (invalidEls && invalidEls.length > 0) {
      // Focus on the first invalid element
      invalidEls[0].focus();
      if (invalidEls[0].select) { invalidEls[0].select(); }

      return false;
    }
    return true;
  },

  onValidSubmit: function(success, error) {
    return function(evt) {
      evt.preventDefault();

      if (self.validate(this)) {
        if (success) {
          success.apply(this, arguments);
        }
      } else {
        if (error) {
          error.apply(this, arguments);
        }
      }
    };
  }
}