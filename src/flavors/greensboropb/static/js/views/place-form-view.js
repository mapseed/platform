var PlaceFormView = require('../../../../../base/static/js/views/place-form-view.js');
var placeFormView_setLocation = PlaceFormView.prototype.setLocation;

module.exports = PlaceFormView.extend({
  setLocation: function(locationData) {
    placeFormView_setLocation.call(this, locationData);

    var $placeNameField = this.$('[name="name"]'),
        $approxAddress = $placeNameField.next(),
        $district;

    if ($approxAddress.length === 0) {
      $approxAddress = $('<p class="approx-address"></p>').insertAfter($placeNameField);
    }

    $approxAddress.html(
      '<br/><span class="address-label">Approximate location:</span> ' +
      '<div class="district-display"></div>' +
      '<div class="address-display">' +
        Handlebars.templates['location-string'](locationData) +
      '</div>');

    $district = $approxAddress.find('.district-display');

    $.ajax({
      url: 'https://shareabouts-region-service.herokuapp.com/api/v1/greensboro/districts-2015?ll=' + locationData.latLng.lat + ',' + locationData.latLng.lng,
      success: function(data) {
        var closedDistricts = []

        $district.html('District' + data['DISTRICT'] + ', ' + 'Council Member' + data['MEMBER']);

        // Let the user know if the district they're trying to leave an idea in
        // has already closed its PB period.
        if (_(closedDistricts).contains(data['CounDist'])) {
          $district.prepend('<span class="closed-district">Please note that the input period for this district is over for 2015.</span> ');
          $('#save-place-btn').prop('disabled', true);
        } else {
          $('#save-place-btn').prop('disabled', false);
        }
      },
      error: function() {
        $district.html('(Outside of the PB districts)');
      }
    });
  }
});