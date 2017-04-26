  module.exports = Backbone.View.extend({
    events: {
      'change .map-legend-basemap-radio': 'toggleBasemap',
      'change .map-legend-checkbox': 'toggleVisibility',
      'change .map-legend-grouping-checkbox': 'toggleHeaderVisibility'
    },

    render: function() {
      var self = this,
          data = _.extend({
            basemaps: this.options.config.basemaps,
            groupings: this.options.config.groupings
          }, Shareabouts.stickyFieldValues);

      this.$el.html(Handlebars.templates['gis-legend-content'](data));

      _.each(this.options.config.groupings, function(group) {
        _.each(group.layers, function(layer) {

          if (layer.constituentLayers) {
            layer.constituentLayers.forEach(function(id) {
              $(Shareabouts).trigger('visibility', [id, !!layer.visibleDefault]);
            });
          } else {
            $(Shareabouts).trigger('visibility', [layer.id, !!layer.visibleDefault]);
          }
        });
      });

      var initialBasemap = _.find(this.options.config.basemaps, function(basemap) {
        return !!basemap.visibleDefault;
      });

      $(Shareabouts).trigger('visibility', [initialBasemap.id, !!initialBasemap.visibleDefault, true]);

      return this;
    },

    // Checkbox change handler, triggers event to the MapView
    toggleVisibility: function(evt) {
      var $cbox = $(evt.target),
          id = $cbox.attr('data-layerid'),
          constituentLayers = $cbox.attr('data-constituent-layers'),
          isChecked = !!$cbox.is(':checked');


      if (constituentLayers) {
        constituentLayers = constituentLayers.trim().split(" ");        
        constituentLayers.forEach(function(id) {
          $(Shareabouts).trigger('visibility', [id, isChecked]);
        });
      } else {
        $(Shareabouts).trigger('visibility', [id, isChecked]);
      }
    },

    toggleBasemap: function(evt) {
      var radio = $(evt.target),
          id = radio.attr('data-layerid'),
          isChecked = !!radio.is(':checked'),
          basemaps = this.options.config.basemaps;

      $(Shareabouts).trigger('visibility', [id, isChecked, true]);
    },

    // Toggles visibility of layers based on header checkbox
    toggleHeaderVisibility: function(evt) {
      var $groupbox = $(evt.target),
           groupid = $groupbox.attr("id"),
           isChecked = $groupbox.is(":checked"),
           group = _.find(this.options.config.groupings, function(group) {
                     return group.id === groupid;
                   });

      for (i = 0; i < group.layers.length; i++) {
        var layer = group.layers[i];
        $(Shareabouts).trigger("visibility", [layer.id, isChecked]);
        $("#map-" + layer.id).prop("checked", isChecked);
      }
    }

  });
