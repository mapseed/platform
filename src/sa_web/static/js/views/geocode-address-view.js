  var Util = require('../utils.js');

  module.exports = Backbone.View.extend({
    events: {
      'submit .geocode-address-form': 'onGeocodeAddress',
      'change .geocode-address-field': 'onAddressChange'
    },
    render: function() {
      var data = this.options.mapConfig;
      this.$el.html(Handlebars.templates['geocode-address'](data));
      return this;
    },
    onAddressChange: function(evt) {
      // .hide().addClass('is-hidden') is a bit redundant, but the .hide
      // is so that we can do a fade-in effect.
      this.$('.error').hide().addClass('is-hidden');
    },
    onGeocodeAddress: function(evt) {
      evt.preventDefault();
      var self = this,
          $address = this.$('.geocode-address-field'),
          address = $address.val(),
          geocodingEngine = this.options.mapConfig.geocoding_engine || 'MapQuest',
          hint = this.options.mapConfig.geocode_bounding_box ||
                 this.options.mapConfig.geocode_hint;

      // Show the spinner
      self.$('.geocode-spinner').removeClass('is-hidden');
      // Make sure there's only one spinner created. Do it here so the element
      // is visible and it gets rendered nicely.
      if (self.$('.geocode-spinner > .spinner').length === 0) {
        new Spinner(Shareabouts.smallSpinnerOptions).spin(this.$('.geocode-spinner')[0]);
      }


      Util[geocodingEngine].geocode(address, hint, {
        success: function(data) {
          var locationsData = data.results[0].locations;
          // Hide the spinner
          self.$('.geocode-spinner').addClass('is-hidden');

          // console.log('Geocoded data: ', data);
          if (locationsData.length > 0) {
            // self.$('.error').hide().addClass('is-hidden');

            // TODO: This might make more sense if the view itself was the
            //       event's target.
            $(Shareabouts).trigger('geocode', [locationsData[0]]);
          } else {
            // TODO: Show some feedback that we couldn't geocode.
            console.error('Woah, no location found for ', data.results[0].providedLocation.location, data);
            self.$('.error').removeClass('is-hidden').hide().fadeIn().html('Could not find that location.');
          }
        },
        error: function() {
          console.error('There was an error while geocoding: ', arguments);
          self.$('.loading').addClass('is-hidden');
        }
      });

      Util.log('USER', 'geocoder', 'geocode-address', address);
    },
    setAddress: function(location) {
      var $address = this.$('.geocode-address-field');
      $address.val(location).change();
    }
  });
