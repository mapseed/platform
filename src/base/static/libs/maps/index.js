import MapboxGLProvider from "./mapboxgl-provider";
// Import other providers here as they become available

var Util = require("../../js/utils.js");
var LayerView = require("mapseed-layer-view");

class MainMap {
  constructor({ container, places, router, mapConfig }) {
    this.mapConfig = mapConfig;

    let MapProvider;
    switch (this.mapConfig.provider) {
      // Add other provider types here as they become available
      case "mapboxgl":
        MapProvider = MapboxGLProvider;
        break;
      default:
        MapProvider = MapboxGLProvider;
        break;
    }

    this.places = places;
    this.router = router;

    const logUserPan = () => {
      Util.log(
        "USER",
        "map",
        "drag",
        this.map.getBBoxString(),
        this.map.getZoom(),
      );
    };

    this.map = MapProvider.createMap(
      container,
      this.mapConfig.options,
      this.mapConfig.vendor_options,
    );

    this.map.addNavControl({
      options: { position: "top-left" },
      vendorOptions:
        this.mapConfig.vendor_options && this.mapConfig.vendor_options.control,
    });

    this.mapConfig.layers.forEach(config => {
      config.loaded = false;
    });

    // TODO: move to redux store?
    this.layers = {};
    this.layerViews = {};

    if (this.mapConfig.geolocation_enabled) {
      this.initGeolocation();
    }

    this.map.on("dragend", logUserPan);
    this.map.on("zoomend", evt => {
      Util.log("APP", "zoom", this.map.getZoom());
      $(Shareabouts).trigger("zoomend", [evt]);
    });

    this.map.on("moveend", evt => {
      Util.log("APP", "center-lat", this.map.getCenter().lat);
      Util.log("APP", "center-lng", this.map.getCenter().lng);

      $(Shareabouts).trigger("mapmoveend", [evt]);
    });

    this.map.on("dragend", evt => {
      $(Shareabouts).trigger("mapdragend", [evt]);
    });

    // Bind place collections event listeners
    Object.entries(this.places, ([collectionId, collection]) => {
      this.layers[collectionId] = this.getLayerGroups(collectionId);
      this.layerViews[collectionId] = {};
      collection.on("reset", this.render, this);
      collection.on("add", this.addLayerView(collectionId), this);
      collection.on("remove", this.removeLayerView(collectionId), this);
    });

    // Bind visiblity event for custom layers
    $(Shareabouts).on("visibility", (evt, id, visible, isBasemap) => {
      var layer = this.layers[id];
      const config = this.mapConfig.layers.find(
        layerConfig => layerConfig.id === id,
      );

      if (config && !config.loaded && visible) {
        this.createLayerFromConfig(config);
        config.loaded = true;
        layer = this.layers[id];
      }

      if (isBasemap) {
        this.checkLayerZoom(config.maxZoom);
        this.map.setMaxZoom(
          config.maxZoom ? config.maxZoom : this.mapConfig.options.maxZoom,
        );

        // TODO
        //_.each(this.options.basemapConfigs, function(basemap) {
        //  if (basemap.id === id) {
        //    self.map.addLayer(layer);
        //    layer.bringToBack();
        //  } else if (self.layers[basemap.id]) {
        //    self.map.removeLayer(self.layers[basemap.id]);
        //  }
        //});
      } else if (layer) {
        self.setLayerVisibility(layer, visible);
      } else {
        // Handles cases when we fire events for layers that are not yet
        // loaded (ie cartodb layers, which are loaded asynchronously)
        // We are setting the asynch layer config's default visibility here to
        // ensure they are added to the map when they are eventually loaded:
        config.asyncLayerVisibleDefault = visible;
      }
    });

    // TEMPORARY: Manually trigger the visibility of a layer for testing
    $(Shareabouts).trigger("visibility", [
      this.mapConfig.layers[0].id,
      true,
      true,
    ]);
  }

  clearFilter() {
    // TODO
  }

  checkLayerZoom(maxZoom) {
    if (maxZoom && this.map.getZoom() > maxZoom) {
      this.map.setZoom(parseInt(maxZoom, 10));
    }
  }

  // Adds or removes the layer  on Master Layer based on visibility
  setLayerVisibility(layer, visible) {
    // TODO: layer id
    if (visible && !this.map.hasLayer(layer._leaflet_id)) {
      this.map.addLayer(layer);
    }
    if (!visible && this.map.hasLayer(layer)) {
      this.map.removeLayer(layer);
    }
  }

  reverseGeocodeMapCenter() {
    const center = this.map.getCenter();
    Util.MapQuest.reverseGeocode(center, {
      success: data => {
        const locationsData = data.results[0].locations;
        // Util.console.log('Reverse geocoded center: ', data);
        $(Shareabouts).trigger("reversegeocode", [locationsData[0]]);
      },
    });
  }

  initGeolocation() {
    const onLocationError = evt => {
      let message;
      switch (evt.code) {
        // Unknown
        case 0:
          message =
            "An unknown error occured while locating your position. Please try again.";
          break;
        // Permission Denied
        case 1:
          message =
            "Geolocation is disabled for this page. Please adjust your browser settings.";
          break;
        // Position Unavailable
        case 2:
          message = "Your location could not be determined. Please try again.";
          break;
        // Timeout
        case 3:
          message =
            "It took too long to determine your location. Please try again.";
          break;
      }
      alert(message);
    };
    const onLocationFound = evt => {
      let msg;
      if (
        !this.map.options.maxBounds ||
        this.map.options.maxBounds.contains(evt.latlng)
      ) {
        this.map.fitBounds(evt.bounds);
      } else {
        msg =
          "It looks like you're not in a place where we're collecting " +
          "data. I'm going to leave the map where it is, okay?";
        alert(msg);
      }
    };

    // Bind event handling
    this.map.on("locationerror", onLocationError);
    this.map.on("locationfound", onLocationFound);

    // Go to the current location if specified
    if (this.mapConfig.geolocation_onload) {
      this.geolocate();
    }
  }

  onClickGeolocate(evt) {
    evt.preventDefault();
    Util.log(
      "USER",
      "map",
      "geolocate",
      this.map.getBBoxString(),
      this.map.getZoom(),
    );
    this.geolocate();
  }

  geolocate() {
    this.map.locate();
  }

  addLayerView(collectionId) {
    return model => {
      this.layerViews[collectionId][model.cid] = new LayerView({
        model: model,
        router: this.router,
        map: this.map,
        layerGroup: this.layers[collectionId],
        placeTypes: this.options.placeTypes,
        // to access the filter
        mapView: this,
      });
    };
  }

  removeLayerView(collectionId) {
    return model => {
      // remove map-bound events for this layer view
      this.map.off(
        "zoomend",
        this.layerViews[collectionId][model.cid].updateLayer,
        this.layerViews[collectionId][model.cid],
      );
      this.map.off(
        "move",
        this.layerViews[collectionId][model.cid].throttledRender,
        this.layerViews[collectionId][model.cid],
      );
      this.map.off(
        "zoomend",
        this.layerViews[collectionId][model.cid].render,
        this.layerViews[collectionId][model.cid],
      );

      this.layerViews[collectionId][model.cid].remove();
      delete this.layerViews[collectionId][model.cid];

      Util.log("APP", "panel-state", "closed");
      if (this.locationTypeFilter) {
        this.router.navigate("filter/" + this.locationTypeFilter, {
          trigger: true,
        });
      } else {
        this.router.navigate("/", { trigger: true });
      }
    };
  }

  zoomInOn(/*latLng*/) {
    // TODO
    //this.map.setView(latLng, this.mapConfig.options.maxZoom || 17);
  }

  filter(locationTypeModel, mapWasUnfiltered, mapWillBeUnfiltered) {
    const locationType = locationTypeModel.get("locationType");
    const isActive = locationTypeModel.get("active");

    if (mapWasUnfiltered || mapWillBeUnfiltered) {
      for (let collectionId in this.places) {
        this.places[collectionId]
          .filter(model => {
            return model.get("location_type") !== locationType;
          })
          .forEach(model => {
            if (mapWasUnfiltered) {
              this.layerViews[collectionId][model.cid].filter();
            } else if (mapWillBeUnfiltered) {
              this.layerViews[collectionId][model.cid].unfilter();
            }
          });
      }
    } else {
      for (let collectionId in this.places) {
        this.places[collectionId]
          .where({ location_type: locationType })
          .forEach(model => {
            isActive
              ? this.layerViews[collectionId][model.cid].unfilter()
              : this.layerViews[collectionId][model.cid].filter();
          });
      }
    }
  }

  clearFilters(/*collectionId*/) {
    // TODO
    //this.locationTypeFilter = null;
    //Object.values(this.places).forEach(collection => {
    //  collection.each(function(model) {
    //    if (self.layerViews[model.cid]) {
    //      self.layerViews[model.cid].render();
    //    }
    //  });
    //});
  }

  getLayerGroups(/*collectionId*/) {
    //  TODO
    //  if (this.isClusterable(collectionId)) {
    //    return L.markerClusterGroup(this.options.cluster);
    //  } else {
    //    return L.layerGroup();
    //  }
  }

  createLayerFromConfig(config) {
    if (config.type && config.type === "mapbox-style") {
      this.map.addMapboxStyle(config.url);
    } else if (config.type && config.type === "raster-tile") {
      this.layers[config.id] = this.map.createRasterTileLayer(config);
      this.map.addLayer(this.layers[config.id]);
    } else if (config.type && config.type === "wms") {
      this.layers[config.id] = this.map.createWMSLayer(config);
      this.map.addLayer(this.layers[config.id]);
    } else if (config.type && config.type === "wmts") {
      this.layers[config.id] = this.map.createWMTSLayer(config);
      this.map.addLayer(this.layers[config.id]);
    } else if (config.type && config.type === "vector-tile") {
      this.map.createVectorTileLayer(config).then(vectorLayerGroupConfig => {
        this.layers[config.id] = vectorLayerGroupConfig;
        this.map.addVectorLayerGroup(this.layers[config.id])
      });
    }

    // TODO: Full layer type support!
    //
    //var self = this,
    //  layer,
    //  collectionId,
    //  collection;

    //if (config.type && config.type === "json") {
    //  var url = config.url;
    //  if (config.sources) {
    //    url += "?";
    //    config.sources.forEach(function(source) {
    //      url += encodeURIComponent(source) + "&";
    //    });
    //  }
    //  config.map = self.map;
    //  layer = L.argo(url, config);
    //  if (self.isClusterable(config.id)) {
    //    layer.on("loaded", layer => {
    //      let clusters = L.markerClusterGroup(self.options.cluster).addLayer(
    //        layer.target,
    //      );
    //      self.layers[config.id] = clusters;
    //      self.map.addLayer(clusters);
    //    });
    //  } else {
    //    self.layers[config.id] = layer;
    //  }
    //} else if (config.type && config.type === "kml") {
    //  $.ajax(config.url).done(function(xml) {
    //    layer = L.argo(toGeoJSON.kml(xml), config);
    //    self.layers[config.id] = layer;
    //    if (config.asyncLayerVisibleDefault) {
    //      layer.addTo(self.map);
    //    }
    //  });
    //} else if (config.type && config.type === "esri-feature") {
    //  if (config.loadStrategy === "all at once") {
    //    // IDs can be returned all at once, while actual geometries are
    //    // capped at 1000 per request. Gets an array of all IDs then
    //    // requests their geometry 1000 at a time.
    //    self.map.fire("layer:loading", { id: config.id });
    //    L.esri.Tasks.query({
    //      url: config.url,
    //    }).ids(function(error, ids) {
    //      var esriLayers = [];

    //      for (var i = 0; i < ids.length; i += 1000) {
    //        L.esri.Tasks.query({ url: config.url })
    //          .featureIds(ids.slice(i, i + 1000))
    //          .run(function(error, geoJson) {
    //            var currentLayer = L.argo(geoJson, config);

    //            if (config.popupContent) {
    //              curentLayer.bindPopup(function(feature) {
    //                return L.Argo.t(config.popupContent, feature.properties);
    //              });
    //            }

    //            esriLayers.push(currentLayer);

    //            if (esriLayers.length === Math.floor(ids.length / 1000) + 1) {
    //              // All requests have completed
    //              self.layers[config.id] = L.layerGroup(esriLayers);
    //              self.map.fire("layer:loaded", { id: config.id });
    //            }
    //          });
    //      }
    //    });
    //  } else {
    //    var configStyled = config.rules != null;
    //    var esriOptions = { url: config.url, ignoreRenderer: configStyled };
    //    if (configStyled) {
    //      esriOptions.style = function(feature) {
    //        return L.Argo.getStyleRule(feature, config.rules)["style"];
    //      };
    //    }
    //    layer = L.esri
    //      .featureLayer(esriOptions)
    //      .on("loading", function() {
    //        self.map.fire("layer:loading", { id: config.id });
    //      })
    //      .on("load", function() {
    //        self.map.fire("layer:loaded", { id: config.id });
    //      });

    //    if (config.popupContent) {
    //      layer.bindPopup(function(feature) {
    //        return L.Argo.t(config.popupContent, feature.properties);
    //      });
    //    }

    //    self.layers[config.id] = layer;
    //  }
    //} else if (config.type && config.type === "place") {
    //  // NOTE: Since places and landmarks have their own url's, loading them
    //  // into our map is handled in our Backbone router.
    //  // nothing to do
    //} else if (config.type && config.type === "landmark") {
    //  // NOTE: Since places and landmarks have their own url's, loading them
    //  // into our map is handled in our Backbone router.
    //  // nothing to do
    //} else if (config.type && config.type === "cartodb") {
    //  this.map.fire("layer:loading", { id: config.id });
    //  cartodb
    //    .createLayer(self.map, config.url, { legends: false })
    //    .on("done", function(cartoLayer) {
    //      self.layers[config.id] = cartoLayer;
    //      self.map.fire("layer:loaded", { id: config.id });
    //      // This is only set when the 'visibility' event is fired before
    //      // our carto layer is loaded:
    //      if (config.asyncLayerVisibleDefault) {
    //        cartoLayer.addTo(self.map);
    //      }
    //    })
    //    .on("error", function(err) {
    //      self.map.fire("layer:error", { id: config.id });
    //      Util.log("Cartodb layer creation error:", err);
    //    });
    //} else if (config.type && config.type === "wmts") {
    //  layer = L.tileLayer
    //    .wmts(config.url, {
    //      service: "WMTS",
    //      tilematrixSet: config.tilematrixSet,
    //      layers: config.layers,
    //      format: config.format,
    //      transparent: config.transparent,
    //      version: config.version,
    //      crs: L.CRS.EPSG3857,
    //      // default TileLayer options
    //      attribution: config.attribution,
    //      opacity: config.opacity,
    //      fillColor: config.color,
    //      weight: config.weight,
    //      fillOpacity: config.fillOpacity,
    //      style: config.style,
    //    })
    //    .on("loading", function() {
    //      self.map.fire("layer:loading", { id: config.id });
    //    })
    //    .on("load", function() {
    //      self.map.fire("layer:loaded", { id: config.id });
    //    })
    //    .on("tileerror", function() {
    //      self.map.fire("layer:error", { id: config.id });
    //    });
    //  self.layers[config.id] = layer;
    //} else if (config.layers) {
    //  // If "layers" is present, then we assume that the config
    //  // references a Leaflet WMS layer.
    //  // http://leafletjs.com/reference.html#tilelayer-wms
    //  layer = L.tileLayer
    //    .wms(config.url, {
    //      layers: config.layers,
    //      format: config.format,
    //      transparent: config.transparent,
    //      version: config.version,
    //      crs: L.CRS.EPSG3857,
    //      // default TileLayer options
    //      attribution: config.attribution,
    //      opacity: config.opacity,
    //      fillColor: config.color,
    //      weight: config.weight,
    //      fillOpacity: config.fillOpacity,
    //    })
    //    .on("loading", function() {
    //      self.map.fire("layer:loading", { id: config.id });
    //    })
    //    .on("load", function() {
    //      self.map.fire("layer:loaded", { id: config.id });
    //    })
    //    .on("tileerror", function() {
    //      self.map.fire("layer:error", { id: config.id });
    //    });
    //  self.layers[config.id] = layer;
    //} else {
    //  // Assume a tile layer
    //  // TODO: Isn't type=tile for back compatibility
    //  layer = L.tileLayer(config.url, config)
    //    .on("loading", function() {
    //      self.map.fire("layer:loading", { id: config.id });
    //    })
    //    .on("load", function() {
    //      self.map.fire("layer:loaded", { id: config.id });
    //    })
    //    .on("tileerror", function() {
    //      self.map.fire("layer:error", { id: config.id });
    //    });
    //  self.layers[config.id] = layer;
    // }
  }
}

export default MainMap;
