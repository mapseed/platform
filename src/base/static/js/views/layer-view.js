  var Util = require('../utils.js');
  var Argo = require('../../libs/leaflet.argo.js');

  module.exports = Backbone.View.extend({
     // A view responsible for the representation of a place on the map.
    initialize: function(){
      this.map = this.options.map;
      this.isFocused = false;
      this.isEditing = false;

      this.layerGroup = this.options.layerGroup;

      // A throttled version of the render function
      this.throttledRender = _.throttle(this.render, 300);

      this.map.on('zoomend', this.updateLayer, this);

      // Bind model events
      this.model.on('change', this.updateLayer, this);
      this.model.on('focus', this.focus, this);
      this.model.on('unfocus', this.unfocus, this);
      this.model.on('destroy', this.onDestroy, this);
      
      // On map move, adjust the visibility of the markers for max efficiency
      this.map.on('move', this.throttledRender, this);

      this.initLayer();
    },
    initLayer: function() {
      var geom, context;

      // Handle if an existing place type does not match the list of available
      // place types.
      this.placeType = this.options.placeTypes[this.model.get('location_type')];
      if (!this.placeType) {
        console.warn('Place type', this.model.get('location_type'),
          'is not configured so it will not appear on the map.');
        return;
      }

      // Don't draw new places. They are shown by the centerpoint in the app view
      if (!this.model.isNew()) {

        // Determine the style rule to use based on the model data and the map
        // state.
        context = _.extend({},
          this.model.toJSON(),
          {map: {zoom: this.map.getZoom()}},
          {layer: {focused: this.isFocused}});
        // Set the icon here:
        this.styleRule = L.Argo.getStyleRule(context, this.placeType.rules);

        // Zoom checks here, for overriding the icon size, anchor, and focus icon:
        if (this.placeType.hasOwnProperty('zoomType')) {
          var zoomRules = this.options.placeTypes[this.placeType.zoomType];
          this.styleRule = L.Argo.getZoomRule(this.styleRule, zoomRules);
        }

        // Construct an appropriate layer based on the model geometry and the
        // style rule. If the place is focused, use the 'focus_' portion of
        // the style rule if it exists.
        geom = this.model.get('geometry');
        if (geom.type === 'Point') {
          this.latLng = L.latLng(geom.coordinates[1], geom.coordinates[0]);

          // If we've saved an icon url in the model, use that
          if (this.model.get("style") && this.model.get("style").iconUrl) {
            this.styleRule.icon.iconUrl = this.model.get("style").iconUrl;
          } 

          if (this.hasIcon()) {
            this.layer = (this.isFocused && this.styleRule.focus_icon ?
              L.marker(this.latLng, {icon: L.icon(this.styleRule.focus_icon)}) :
              L.marker(this.latLng, {icon: L.icon(this.styleRule.icon)}));
          } else if (this.hasStyle()) {
            this.layer = (this.isFocused && this.styleRule.focus_style ?
              L.circleMarker(this.latLng, this.styleRule.focus_style) :
              L.circleMarker(this.latLng, this.styleRule.style));
          }
        } else {
          this.layer = L.GeoJSON.geometryToLayer(geom);
          if (this.model.get("style")) {
            this.layer.setStyle(this.model.get("style"));
          } else {
            this.layer.setStyle(this.styleRule.style);
          }
        }

        // Focus on the layer onclick
        if (this.layer) {
          this.layer.on('click', this.onMarkerClick, this);
        }

        this.render();
      }
    },
    onDestroy: function() {
      // NOTE: it's necessary to remove the zoomend event here
      // so this view won't try to recreate a marker when the map is
      // zoomed. Somehow even when a layer view is removed, the
      // zoomend listener on the map still retains a reference to it
      // and is capable of calling view methods on a "deleted" view.
      this.map.off('zoomend', this.updateLayer, this);
    },
    updateLayer: function() {
      if (!this.isEditing) {
        // Update the marker layer if the model changes and the layer exists.
        // Don't update if the layer is in editing mode, as this interferes 
        // with the Leaflet draw plugin.
        this.removeLayer();
        this.initLayer();
      }
    },
    removeLayer: function() {
      if (this.layer) {
        this.layerGroup.removeLayer(this.layer);
      }
    },
    render: function() {
      if (!this.isEditing) {
        
        // Show if it is within the current map bounds
        var mapBounds = this.map.getBounds();
        if (this.latLng) {
          if (mapBounds.contains(this.latLng)) {
            this.show();
          } else {
            this.hide();
          }
        } else {
          this.show();
        }
      }
    },
    onMarkerClick: function() {
      Util.log('USER', 'map', 'place-marker-click', this.model.getLoggingDetails());
      // support places with landmark-style urls
      if (this.model.get("url-title")) {
        this.options.router.navigate('/' + this.model.get("url-title"), {trigger: true});
      } else {
        this.options.router.navigate('/' + this.model.get('datasetSlug') + '/' + this.model.id, {trigger: true});
      }      
    },
    isPoint: function() {
      return this.model.get('geometry').type == 'Point';
    },
    hasIcon: function() {
      return this.styleRule && this.styleRule.icon;
    },
    hasStyle: function() {
      return this.styleRule && this.styleRule.style;
    },

    focus: function() {
      if (!this.isFocused) {
        this.isFocused = true;
        this.updateLayer();
      }
    },
    unfocus: function() {
      if (this.isFocused) {
        this.isFocused = false;
        this.updateLayer();
      }
    },
    remove: function() {
      this.removeLayer();
      this.map.off('move', this.throttledRender, this);
    },
    setIcon: function(icon) {
      if (this.layer) {
        this.layer.setIcon(icon);
      }
    },
    show: function() {
      if (!this.options.mapView.locationTypeFilter ||
        this.options.mapView.locationTypeFilter.toUpperCase() === this.model.get('location_type').toUpperCase()) {
        if (this.layer) {
          this.layerGroup.addLayer(this.layer);
        }
      } else {
        this.hide();
      }

    },
    hide: function() {
      this.removeLayer();
    }
  });
