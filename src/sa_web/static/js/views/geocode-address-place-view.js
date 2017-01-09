  var GeocodeAddressView = require('./geocode-address-view.js');

  module.exports = GeocodeAddressView.extend({
    events: {
      'change .geocode-address-field': 'onAddressChange',
      'blur .geocode-address-field': 'onGeocodeAddress'
    },
    render: function() {
      return this;
    }
  });
