// BEGIN FLAVOR-SPECIFIC CODE
let PlaceFormView = require("../../../../../base/static/js/views/place-form-view.js");
let Util = require("../../../../../base/static/js/utils.js");

const SCHOOL_DISTRICTS = {
  "Alcott-Elementary-School": "Lake Washington School District",
  "Audubon-Elementary-School": "Lake Washington School District",
  "Bell-Elementary-School": "Lake Washington School District",
  "Blackwell-Elementary-School": "Lake Washington School District",
  "Carson-Elementary-School": "Lake Washington School District",
  "Community-School": "Lake Washington School District",
  "Dickinson-Elementary-School": "Lake Washington School District",
  "Discovery-Elementary-School": "Lake Washington School District",
  "Eastlake-High-School": "Lake Washington School District",
  "Einstein-Elementary-School": "Lake Washington School District",
  "Emerson-High-School": "Lake Washington School District",
  "Emerson-K-12": "Lake Washington School District",
  "Environmental-And-Adventure-School": "Lake Washington School District",
  "Evergreen-Middle-School": "Lake Washington School District",
  "Explorer-Community-School": "Lake Washington School District",
  "Finn-Hill-Middle-School": "Lake Washington School District",
  "Franklin-Elementary-School": "Lake Washington School District",
  "Frost-Elementary-School": "Lake Washington School District",
  "Futures-School": "Lake Washington School District",
  "Inglewood-Middle-School": "Lake Washington School District",
  "International-Community-School": "Lake Washington School District",
  "Juanita-Elementary-School": "Lake Washington School District",
  "Juanita-High-School": "Lake Washington School District",
  "Kamiakin-Middle-School": "Lake Washington School District",
  "Keller-Elementary-School": "Lake Washington School District",
  "Kirk-Elementary-School": "Lake Washington School District",
  "Kirkland-Middle-School": "Lake Washington School District",
  "Lake-Washington-High-School": "Lake Washington School District",
  "Lakeview-Elementary-School": "Lake Washington School District",
  "Mann-Elementary-School": "Lake Washington School District",
  "McAuliffe-Elementary-School": "Lake Washington School District",
  "Mead-Elementary-School": "Lake Washington School District",
  "Muir-Elementary-School": "Lake Washington School District",
  "Northstar-Middle-School": "Lake Washington School District",
  "Redmond-Elementary-School": "Lake Washington School District",
  "Redmond-Middle-School": "Lake Washington School District",
  "Redmond-High-School": "Lake Washington School District",
  "Renaissance-School-of-Art-And-Reasoning": "Lake Washington School District",
  "Rockwell-Elementary-School": "Lake Washington School District",
  "Rosa-Parks-Elementary-School": "Lake Washington School District",
  "Rose-Hill-Elementary-School": "Lake Washington School District",
  "Rush-Elementary-School": "Lake Washington School District",
  "Sandburg-Elementary-School": "Lake Washington School District",
  "Smith-Elementary-School": "Lake Washington School District",
  "Stella-Schola-Middle-School": "Lake Washington School District",
  "TESLA-STEM-High-School": "Lake Washington School District",
  "Thoreau-Elementary-School": "Lake Washington School District",
  "Twain-Elementary-School": "Lake Washington School District",
  "Wilder-Elementary-School": "Lake Washington School District",
  "Ardmore-Elementary-School": "Bellevue School District",
  "Bennett-Elementary-School": "Bellevue School District",
  "Cherry-Crest-Elementary-School": "Bellevue School District",
  "Clyde-Hill-Elementary-School": "Bellevue School District",
  "Eastgate-Elementary-School": "Bellevue School District",
  "Enatai-Elementary-School": "Bellevue School District",
  "Lake-Hills-Elementary-School": "Bellevue School District",
  "Medina-Elementary-School": "Bellevue School District",
  "Newport-Heights-Elementary-School": "Bellevue School District",
  "Phantom-Lake-Elementary-School": "Bellevue School District",
  "Sherwood-Forest-Elementary-School": "Bellevue School District",
  "Somerset-Elementary-School": "Bellevue School District",
  "Spiritridge-Elementary-School": "Bellevue School District",
  "Stevenson-Elementary-School": "Bellevue School District",
  "Wilburton-Elementary-School": "Bellevue School District",
  "Woodridge-Elementary-School": "Bellevue School District",
  "Chinook-Middle-School": "Bellevue School District",
  "Highland-Middle-School": "Bellevue School District",
  "Odle-Middle-School": "Bellevue School District",
  "Tillicum-Middle-School": "Bellevue School District",
  "Tyee-Middle-School-": "Bellevue School District",
  "Bellevue-High-School": "Bellevue School District",
  "Interlake-High-School": "Bellevue School District",
  "Newport-High-School": "Bellevue School District",
  "Sammamish-High-School": "Bellevue School District",
  "Bellevue-Big-Picture-School": "Bellevue School District",
  "International-School": "Bellevue School District",
  "Jing-Mei-Elementary-School": "Bellevue School District",
  "Puesta-Del-Sol-Elementary-School": "Bellevue School District",
  "Apollo-Elementary-School": "Issaquah School District",
  "Beaver-Lake-Middle-School": "Issaquah School District",
  "Briarwood-Elementary-School": "Issaquah School District",
  "Cascade-Ridge-Elementary-School": "Issaquah School District",
  "Challenger-Elementary-School": "Issaquah School District",
  "Clark-Elementary-School": "Issaquah School District",
  "Cougar-Ridge-Elementary-School": "Issaquah School District",
  "Creekside-Elementary-School": "Issaquah School District",
  "Discovery-Elementary-School": "Issaquah School District",
  "Endeavour-Elementary-School": "Issaquah School District",
  "Gibson-Ek-High-School": "Issaquah School District",
  "Grand-Ridge-Elementary-School": "Issaquah School District",
  "Issaquah-High-School": "Issaquah School District",
  "Issaquah-Middle-School": "Issaquah School District",
  "Issaquah-Valley-Elementary-School": "Issaquah School District",
  "Liberty-High-School": "Issaquah School District",
  "Maple-Hills-Elementary-School": "Issaquah School District",
  "Maywood-Middle-School": "Issaquah School District",
  "Newcastle-Elementary-School": "Issaquah School District",
  "Pacific-Cascade-Middle-School": "Issaquah School District",
  "Pine-Lake-Middle-School": "Issaquah School District",
  "Skyline-High-School": "Issaquah School District",
  "Sunny-Hills-Elementary-School": "Issaquah School District",
  "Sunset-Elementary-School": "Issaquah School District",
  "Carriage-Crest-Elementary-School": "Kent School District",
  "Cedar-Heights-Middle-School": "Kent School District",
  "Cedar-Valley-Elementary-School": "Kent School District",
  "Covington-Elementary-School": "Kent School District",
  "Crestwood-Elementary-School": "Kent School District",
  "East-Hill-Elementary-School": "Kent School District",
  "Emerald-Park-Elementary-School": "Kent School District",
  "Fairwood-Elementary-School": "Kent School District",
  "George-T-Daniel-Elementary-School": "Kent School District",
  "Glenridge-Elementary-School": "Kent School District",
  "Grass-Lake-Elementary-School": "Kent School District",
  "Horizon-Elementary-School": "Kent School District",
  "iGrad": "Kent School District",
  "Jenkins-Creek-Elementary-School": "Kent School District",
  "Kent-Elementary-School": "Kent School District",
  "Kent-Mountain-View-Academy": "Kent School District",
  "Kent-Phoenix-Academy": "Kent School District",
  "Kent-Valley-Early-Learning-Center": "Kent School District",
  "Kentlake-High-School": "Kent School District",
  "Kent-Meridian-High-School": "Kent School District",
  "Kentridge-High-School": "Kent School District",
  "Kentwood-High-School": "Kent School District",
  "Lake-Youngs-Elementary-School": "Kent School District",
  "Martin-Sortun-Elementary-School": "Kent School District",
  "Mattson-Middle-School": "Kent School District",
  "Meadow-Ridge-Elementary-School": "Kent School District",
  "Meeker-Middle-School": "Kent School District",
  "Meridian-Elementary-School": "Kent School District",
  "Meridian-Middle-School": "Kent School District",
  "Mill-Creek-Middle-School": "Kent School District",
  "Millennium-Elementary-School": "Kent School District",
  "Neely-OBrien-Elementary-School": "Kent School District",
  "Northwood-Middle-School": "Kent School District",
  "Panther-Lake-Elementary-School": "Kent School District",
  "Park-Orchard-Elementary-School": "Kent School District",
  "Pine-Tree-Elementary-School": "Kent School District",
  "Ridgewood-Elementary-School": "Kent School District",
  "Sawyer-Woods-Elementary-School": "Kent School District",
  "Scenic-Hill-Elementary-School": "Kent School District",
  "Soos-Creek-Elementary-School": "Kent School District",
  "Springbrook-Elementary-School": "Kent School District",
  "Sunrise-Elementary-School": "Kent School District",
  "Alpac-Elementary-School": "Auburn School District",
  "Arthur-Jacobsen-Elementary-School": "Auburn School District",
  "Auburn-High-School": "Auburn School District",
  "Auburn-Mountainview-High-School": "Auburn School District",
  "Auburn-Riverside-High-School": "Auburn School District",
  "Cascade-Middle-School": "Auburn School District",
  "Chinook-Elementary-School": "Auburn School District",
  "Dick-Scobee-Elementary-School": "Auburn School District",
  "Evergreen-Heights-Elementary-School": "Auburn School District",
  "Gildo-Rey-Elementary-School": "Auburn School District",
  "Hazelwood-Elementary-School": "Auburn School District",
  "Ilalko-Elementary-School": "Auburn School District",
  "Lake-View-Elementary-School": "Auburn School District",
  "Lakeland-Hills-Elementary-School": "Auburn School District",
  "Lea-Hill-Elementary-School": "Auburn School District",
  "Mt-Baker-Middle-School": "Auburn School District",
  "Olympic-Middle-School": "Auburn School District",
  "Pioneer-Elementary-School": "Auburn School District",
  "Rainier-Middle-School": "Auburn School District",
  "Terminal-Park-Elementary-School": "Auburn School District",
  "Washington-Elementary-School": "Auburn School District",
  "West-Auburn-High-School": "Auburn School District",
  "Cleveland-High-School": "Seattle Public Schools",
  "Chief-Sealth-High-District": "Seattle Public Schools",
  "Denny-Middle-School": "Seattle Public Schools"
};
// END FLAVOR-SPECIFIC CODE

module.exports = PlaceFormView.extend({
  getAttrs: function() {
    var self = this,
      attrs = {},
      locationAttr = this.options.placeConfig.location_item_name,
      $form = this.$("form"),
      attrs = Util.getAttrs($form);

    // Get values off of binary toggle buttons that have not been toggled
    $.each(
      $("input[data-input-type='binary_toggle']:not(:checked)"),
      function() {
        attrs[$(this).attr("name")] = $(this).val();
      },
    );

    _.each(attrs, function(value, key) {
      var itemConfig =
        _.find(
          self.formState.selectedCategoryConfig.fields.concat(
            self.formState.commonFormElements,
          ),
          function(field) {
            return field.name === key;
          },
        ) || {};
      if (itemConfig.autocomplete) {
        Util.saveAutocompleteValue(key, value, 30);
      }
    });

    if (this.geometryEnabled) {
      attrs.geometry = this.geometryEditorView.geometry;
    } else {
      // If the selected category does not have geometry editing enabled,
      // assume we're adding point geometry
      attrs.geometry = {
        type: "Point",
        coordinates: [this.center.lng, this.center.lat],
      };
    }

    if (this.location && locationAttr) {
      attrs[locationAttr] = this.location;
    }

    // BEGIN FLAVOR-SPECIFIC CODE
    attrs.district = SCHOOL_DISTRICTS[attrs["school-name"]] || "";
    // END FLAVOR-SPECIFIC CODE

    return attrs;
  },
});
