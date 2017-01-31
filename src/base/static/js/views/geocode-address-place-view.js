/*globals L Backbone _ Handlebars jQuery Spinner */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
S.GeocodeAddressPlaceView = S.GeocodeAddressView.extend({
  events: {
    'change .geocode-address-field': 'onAddressChange',
    'blur .geocode-address-field': 'onGeocodeAddress'
  },
  render: function() {
    return this;
  }
});

}(Shareabouts, jQuery, Shareabouts.Util.console));
