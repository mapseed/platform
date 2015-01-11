var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LegendView = Backbone.View.extend({
    initialize: function () {

      var this_ = {};
      var self = this;

      // Cache the root element
      this_.$el = $(self.options.el);

      // Render the legend
      this_.$el.append(self.render());

      // Bind the checkbox change event
//      this_.$el.find('.map-legend-checkbox').on('change', self.toggleVisibility);
      this_.$el.find('.map-legend-checkbox').on('change', self.toggleVisibility);

      console.log("Inside LegendView, self:");
      console.log(self);
    },

    render: function () {
//     var $markup = $('<ul class="map-legend-list"></ul>'),
      var $markup = $('<ul class="layer-type-list unstyled-list">'),
        i, checked, layer;
      var legendLayerId = 0;

      for (i = 0; i < this.options.layers.length; i++) {
        layer = this.options.layers[i];
        checked = layer.visible ? 'checked="checked"' : '';

        if (layer.legend == true) {
          $markup.append('<li class="layer-type-li">' +
//            '<div class="map-legend-desc-title">' + layer.title + '</div>' +
//            '<div class="map-legend-desc-content">' + layer.description + '</div>' +
//            '</div>' +
            '<div class="layer-type-title">' +
            '<input id="map-' + legendLayerId + '" data-layerid="' + legendLayerId + '" ' +
            checked + ' class="map-legend-checkbox" type="checkbox"></input>' +
            '<label for="map-' + legendLayerId + '">' + layer.title + '</label>' +
            '</div>' +
            '<span class="layer-type-description">' + layer.description + '</span>' +
            '</li>');
          legendLayerId++;
//          $markup.append('<li class="map-legend-item">' +
//            '<div class="map-legend-desc">' +
//            '<div class="map-legend-desc-title">' + layer.title + '</div>' +
//            '<div class="map-legend-desc-content">' + layer.description + '</div>' +
//            '</div>' +
//            '<div class="map-legend-title">' +
//            '<input id="map-' + layer.id + '" data-layerid="' + layer.id + '" ' +
//            checked + ' class="map-legend-checkbox" type="checkbox"></input>' +
//            '<label for="map-' + layer.id + '">' + layer.title + '</label>' +
//            '</div>' +
//            '</li>');
        }
      }
      $markup.append("</ul>");
//      $markup.append('<hr><ul class="map-layer-list unstyled-list">');
      $markup.append('<hr><p>Toggle these Shareabouts layers:</p><ul class="master-layer-list unstyled-list"></ul>');
      legendLayerId = 0;

//      console.log("Place types: ");
//      console.log(this.options.layers.length);
      for (i = 0; i < this.options.layers.length; i++) {
        layer = this.options.layers[i];
        checked = layer.visible ? 'checked="checked"' : '';

        if (layer.shareabouts == true) {
          $markup.append('<li class="shareabouts-layer-li legend-layer-li">' +
            '<img class="' + layer.title + '" src="' + layer.image + '">' + layer.title +
//            '<input id="map-' + legendLayerId + '" data-layerid="' + legendLayerId + '" ' +
//            checked + ' class="map-legend-checkbox" type="checkbox"></input>' +
//            '<label for="map-' + legendLayerId + '">' + layer.title + '</label>' +
//            '</div>' +
//            '<span class="layer-type-description">' + layer.description + '</span>' +
            '</li>');
//      <!--<ul class="map-layer-list unstyled-list">-->
//        <!--<li><span class="road-color" style="background-color:#fc7165;"></span>Pedestrian crash corridors (top 10% of streets in each borough)</li>-->
//        <!--<li><img class="fatality" src="styles/images/red-square-stroked-14.png">&nbsp;Pedestrian fatality (2008-12)</li>-->
//        <!--<li><span class="road-color" style="background-color:#ffff99;"></span>Major arterial roads</li>-->
//        <!--</ul>-->
          legendLayerId++;
//          $markup.append('<li class="map-legend-item">' +
//            '<div class="map-legend-desc">' +
//            '<div class="map-legend-desc-title">' + layer.title + '</div>' +
//            '<div class="map-legend-desc-content">' + layer.description + '</div>' +
//            '</div>' +
//            '<div class="map-legend-title">' +
//            '<input id="map-' + layer.id + '" data-layerid="' + layer.id + '" ' +
//            checked + ' class="map-legend-checkbox" type="checkbox"></input>' +
//            '<label for="map-' + layer.id + '">' + layer.title + '</label>' +
//            '</div>' +
//            '</li>');
        }
      }
      return $markup;
    },

      // Checkbox change handler, triggers event to the MapView
    toggleVisibility: function(evt) {
      console.log("toggling visibility in legend-view");
      console.log("toggle visbility event is: ");
      console.log(evt);

      var $cbox = $(evt.target),
        id = $cbox.attr('data-layerid');

      console.log("toggle visibility cbox:");
      console.log($cbox);
      console.log("toggle visibility id: ");
      console.log(id);
      if ($cbox.is(':checked')) {
        $(S).trigger('visibility', [id, true]);
      } else {
        $(S).trigger('visibility', [id, false]);
      }
    }
  });
})(Shareabouts, jQuery, Shareabouts.Util.console);