/*globals L Backbone _ */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.MapView = Backbone.View.extend({
    events: {
      'click .locate-me': 'onClickGeolocate'
    },
    initialize: function() {
      var self = this,
          i, layerModel,
          logUserZoom = function() {
            S.Util.log('USER', 'map', 'zoom', self.map.getBounds().toBBoxString(), self.map.getZoom());
          },
          logUserPan = function(evt) {
            S.Util.log('USER', 'map', 'drag', self.map.getBounds().toBBoxString(), self.map.getZoom());
          };

      self.map = L.map(self.el, self.options.mapConfig.options);

      self.placeLayers = self.getLayerGroups();

      self.layers = {};

      // Add layers defined in the config file
      _.each(self.options.mapConfig.layers, function(config){
        var layer;
        // "type" is required by Argo for fetching data, so it's a pretty good
        // Argo indicator. Argo is this by the way: https://github.com/openplans/argo/
        if (config.type) {
          layer = L.argo(config.url, config);
          self.layers[config.id] = layer;

        // "layers" is required by Leaflet WMS for fetching data, so it's a pretty good
        // that the layer is WMS. Documentation here: http://leafletjs.com/reference.html#tilelayer-wms
        } else if (config.layers) {
          layer = L.tileLayer.wms(config.url, {
            layers: config.layers,
            format: config.format,
            transparent: config.transparent,
            version: config.version,
            crs: L.CRS.EPSG3857,
            // default TileLayer options
            attribution: config.attribution,
            opacity: config.opacity,
            fillColor: config.color,
            weight: config.weight,
            fillOpacity: config.fillOpacity
          });
          self.layers[config.id] = layer;

        } else {
          // Assume a tile layer
          layer = L.tileLayer(config.url, config);

          layer.addTo(self.map);
        }
        // Add the default visible layers to the map
        if (config.visible != false && !config.shareabouts) {
          layer.addTo(self.map);
        }
      });
      // Remove default prefix
      self.map.attributionControl.setPrefix('');

      // Init geolocation
      if (self.options.mapConfig.geolocation_enabled) {
        self.initGeolocation();
      }

      self.map.addLayer(self.placeLayers);

      // Add our landmark layer collections to the map
      this.landmarkLayers = {}
      this.landmarkLayerViews = {};
      _.each(Object.keys(self.options.landmarkCollections), function(collectionId) {
        self.landmarkLayers[collectionId] = L.layerGroup();
        self.map.addLayer(self.landmarkLayers[collectionId]);

        self.landmarkLayerViews[collectionId] = {};
      })

      // Init the layer view cache
      this.layerViews = {};

      self.map.on('dragend', logUserPan);
      $(self.map.zoomControl._zoomInButton).click(logUserZoom);
      $(self.map.zoomControl._zoomOutButton).click(logUserZoom);

      self.map.on('zoomend', function(evt) {
        S.Util.log('APP', 'zoom', self.map.getZoom());
      });

      self.map.on('moveend', function(evt) {
        S.Util.log('APP', 'center-lat', self.map.getCenter().lat);
        S.Util.log('APP', 'center-lng', self.map.getCenter().lng);

        $(S).trigger('mapmoveend', [evt]);
      });

      self.map.on('dragend', function(evt) {
        $(S).trigger('mapdragend', [evt]);
      });

      // Bind data events
      self.collection.on('reset', self.render, self);
      self.collection.on('add', self.addLayerView, self);
      self.collection.on('remove', self.removeLayerView, self);

      // Bind data events for our landmark collections
      _.each(Object.keys(self.options.landmarkCollections), function(collectionId) {
        var collection = self.options.landmarkCollections[collectionId]
        collection.on('add', self.addLandmarkLayerView(collectionId), self);
        collection.on('remove', self.removeLandmarkLayerView(collectionId), self);
      });

      // Bind visiblity event for custom layers
      $(S).on('visibility', function (evt, id, visible) {
        self.setLayerVisibility(self.layers[id], visible);
      });
    }, // end initialize

    // Adds or removes the layer  on Master Layer based on visibility
    setLayerVisibility: function(layer, visible) {
      this.map.closePopup();
      if (visible && !this.map.hasLayer(layer)) {
        this.map.addLayer(layer);
      }
      if (!visible && this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    },
    reverseGeocodeMapCenter: _.debounce(function() {
      var center = this.map.getCenter();
      S.Util.MapQuest.reverseGeocode(center, {
        success: function(data) {
          var locationsData = data.results[0].locations;
          // S.Util.console.log('Reverse geocoded center: ', data);
          $(S).trigger('reversegeocode', [locationsData[0]]);
        }
      });
    }, 1000),
    render: function() {
      var self = this;

      // Clear any existing stuff on the map, and free any views in
      // the list of layer views.
      this.placeLayers.clearLayers();
      this.layerViews = {};
      _.each(Object.keys(self.options.landmarkCollections), function(collectionId) {
        self.landmarkLayers[collectionId].clearLayers();
        self.landmarkLayerViews[collectionId] = {};
      });

      this.collection.each(function(model, i) {
        self.addLayerView(model);
      });
    },
    initGeolocation: function() {
      var self = this;

      var onLocationError = function(evt) {
        var message;
        switch (evt.code) {
          // Unknown
          case 0:
            message = 'An unknown error occured while locating your position. Please try again.';
            break;
          // Permission Denied
          case 1:
            message = 'Geolocation is disabled for this page. Please adjust your browser settings.';
            break;
          // Position Unavailable
          case 2:
            message = 'Your location could not be determined. Please try again.';
            break;
          // Timeout
          case 3:
            message = 'It took too long to determine your location. Please try again.';
            break;
        }
        alert(message);
      };
      var onLocationFound = function(evt) {
        var msg;
        if(!self.map.options.maxBounds ||self.map.options.maxBounds.contains(evt.latlng)) {
          self.map.fitBounds(evt.bounds);
        } else {
          msg = 'It looks like you\'re not in a place where we\'re collecting ' +
            'data. I\'m going to leave the map where it is, okay?';
          alert(msg);
        }
      };
      // Add the geolocation control link
      this.$('.leaflet-top.leaflet-right').append(
        '<div class="leaflet-control leaflet-bar">' +
          '<a href="#" class="locate-me"></a>' +
        '</div>'
      );

      // Bind event handling
      this.map.on('locationerror', onLocationError);
      this.map.on('locationfound', onLocationFound);

      // Go to the current location if specified
      if (this.options.mapConfig.geolocation_onload) {
        this.geolocate();
      }
    },
    onClickGeolocate: function(evt) {
      evt.preventDefault();
      S.Util.log('USER', 'map', 'geolocate', this.map.getBounds().toBBoxString(), this.map.getZoom());
      this.geolocate();
    },
    geolocate: function() {
      this.map.locate();
    },
    addLandmarkLayerView: function(landmarkCollectionId) {
      return function(model) {
        this.landmarkLayerViews[landmarkCollectionId][model.id] = new S.BasicLayerView({
          model: model,
          router: this.options.router,
          map: this.map,
          placeTypes: this.options.placeTypes,
          collectionId: landmarkCollectionId,
          landmarkLayers: this.landmarkLayers[landmarkCollectionId],
          // to access the filter
          mapView: this
        });
      }
    },
    removeLandmarkLayerView: function(landmarkCollectionId) {
      return function(model) {
        this.landmarkLayerViews[landmarkCollectionId][model.id].remove();
        delete this.landmarkLayerViews[landmarkCollectionId][model.id];
      }
    },
    addLayerView: function(model) {
      this.layerViews[model.cid] = new S.LayerView({
        model: model,
        router: this.options.router,
        map: this.map,
        placeLayers: this.placeLayers,
        placeTypes: this.options.placeTypes,
        // to access the filter
        mapView: this
      });
    },
    removeLayerView: function(model) {
      this.layerViews[model.cid].remove();
      delete this.layerViews[model.cid];
    },
    zoomInOn: function(latLng) {
      this.map.setView(latLng, this.options.mapConfig.options.maxZoom || 17);
    },

    filter: function(locationType) {
      var self = this;
      console.log('filter the map', arguments);
      this.locationTypeFilter = locationType;
      this.collection.each(function(model) {
        var modelLocationType = model.get('location_type');

        if (modelLocationType &&
          modelLocationType.toUpperCase() === locationType.toUpperCase()) {
          self.layerViews[model.cid].show();
        } else {
          self.layerViews[model.cid].hide();
        }
      });
      // TODO: clean this up by using a single Collection or View that contains
      // landmarks and places
      _.each(Object.keys(self.options.landmarkCollections), function(collectionId) {
        self.options.landmarkCollections[collectionId].each(function(model) {
          var modelLocationType = model.get('location_type');

          if (modelLocationType &&
              modelLocationType.toUpperCase() === locationType.toUpperCase()) {
            self.landmarkLayerViews[collectionId][model.id].show();
          } else {
            self.landmarkLayerViews[collectionId][model.id].hide();
          }
        });
      });
    },

    clearFilter: function() {
      var self = this;
      this.locationTypeFilter = null;
      this.collection.each(function(model) {
        self.layerViews[model.cid].render();
      });
      // TODO: clean this up by using a single Collection or View that contains
      // landmarks and places
      _.each(Object.keys(self.options.landmarkCollections), function(collectionId) {
        self.options.landmarkCollections[collectionId].each(function(model) {
          self.landmarkLayerViews[collectionId][model.id].render();
        });
      });
    },
    getLayerGroups: function() {
      var self = this;
      var clusterOptions = self.options.cluster;
      if (!clusterOptions) {
        return L.layerGroup();
      } else {
        return L.markerClusterGroup({
          iconCreateFunction: function(cluster) {
            var markers = cluster.getAllChildMarkers();
            var n = markers.length;
            var small = n < clusterOptions.threshold;
            var className = small ? clusterOptions.class_small: clusterOptions.class_large;
            var size = small ? clusterOptions.size_small : clusterOptions.size_large;
            return L.divIcon({ html: n, className: className, iconSize: [size, size] });
          }
        });
      }
    }
  });

})(Shareabouts, jQuery, Shareabouts.Util.console);
