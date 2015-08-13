var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LegendView = Backbone.View.extend({
    initialize: function () {

      var this_ = {};
      var self = this;

      // Cache the root element
      this_.$el = $(self.options.el);

      // Render the legend
      this_.$el.append(self.renderShareaboutsLayers());
      this_.$el.append('<hr>');
      this_.$el.append(self.renderInfoLayers());
      this_.$el.append('<hr>');

      // Bind the checkbox change event
      this_.$el.find('.map-legend-checkbox').on('change', self.toggleVisibility);
    },

    renderInfoLayers: function () {
      var $markup = '<p>Map layers:</p><ul class="layer-type-list unstyled-list">',
        i, checked, layer;
      var legendLayerId = 0;

      for (i = 0; i < this.options.layers.length; i++) {
        layer = this.options.layers[i];
        checked = layer.visible ? 'checked="checked"' : '';

        if (layer.legend == true) {
          $markup += '<li class="layer-type-li">' +
            '<div class="layer-type-title">' +
            '<input id="map-' + legendLayerId + '" data-layerid="' + legendLayerId + '" ' +
            checked + ' class="map-legend-checkbox" type="checkbox"></input>' +
            '<label for="map-' + legendLayerId + '">' + layer.title + '</label>' +
            '</div>' +
            '<span class="layer-type-description">' + layer.description + '</span>' +
            '</li>';
          legendLayerId++;
        }
      }
      $markup += "</ul>";
      return $markup;
    },

    renderShareaboutsLayers: function () {
      var $shareMarkup = '<p>Report Types:</p><ul class="master-layer-list unstyled-list">',
        i, layer;

      for (i = 0; i < this.options.sidebarConfig.reports.length; i++) {
        layer = this.options.sidebarConfig.reports[i];

        $shareMarkup += '<li class="shareabouts-layer-li legend-layer-li">' +
          '<a href="' + layer.url + '">' +
          '<img class="' + 'shareabouts-layer-title' + '" location="' + layer.title + '" layer-title="' + layer.title +
          '" src="' + layer.image + '">' + layer.title +
          '</a>' +
          '</li>';
      }

      $shareMarkup += "</ul>";
      return $shareMarkup;
    },

    // Checkbox change handler, triggers event to the MapView
    toggleVisibility: function(evt) {

      var $cbox = $(evt.target),
        id = $cbox.attr('data-layerid');

      if ($cbox.is(':checked')) {
        $(S).trigger('visibility', [id, true]);
      } else {
        $(S).trigger('visibility', [id, false]);
      }
    }
  });
})(Shareabouts, jQuery, Shareabouts.Util.console);