import MapboxGLProvider from "./mapboxgl-provider";
// Import other providers here as they become available

import emitter from "../../utils/emitter";

var Util = require("../../js/utils.js");

class MainMap {
  constructor({ container, places, router, mapConfig, placeTypeConfig }) {
    this.mapConfig = mapConfig;
    this.placeTypeConfig = placeTypeConfig;
    this.router = router;

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

    this.map = MapProvider(container, this.mapConfig.options);

    this.mapConfig.layers.forEach(config => {
      config.loaded = false;
    });

    // TODO: move to redux store?
    this.layers = {};

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

    emitter.addListener("place-collection:loaded", data => {
      this.addPlaceCollectionLayer(data.collectionId, data.collection);
    });

    emitter.addListener("place-collection:add-place", data => {
      this.updatePlaceCollectionLayer(data.collectionId, data.collection);
    });

    // Bind visiblity event for custom layers
    $(Shareabouts).on("visibility", async (evt, id, visible, isBasemap) => {
      var layer = this.layers[id];
      const config = this.mapConfig.layers.find(
        layerConfig => layerConfig.id === id,
      );

      if (config && !config.loaded && visible) {
        await this.createLayerFromConfig(config);
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

    // TEMPORARY: Manually trigger the visibility of layers for testing
    this.map.on("load", () => {
      $(Shareabouts).trigger("visibility", [
        this.mapConfig.layers[0].id,
        true,
        true,
      ]);
      $(Shareabouts).trigger("visibility", [
        this.mapConfig.layers[4].id,
        true,
        true,
      ]);
    });
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

  createGeoJSONFromCollection(collection) {
    const geoJSON = {
      type: "FeatureCollection",
      features: [],
    };

    collection.each(model => {
      const properties = Object.keys(model.attributes)
        .filter(key => key !== "geometry")
        .reduce((geoJSONProperties, property) => {
          geoJSONProperties[property] = model.get(property);
          return geoJSONProperties;
        }, {});

      geoJSON.features.push({
        type: "Feature",
        properties: properties,
        geometry: model.get("geometry"),
      });
    });

    return geoJSON;
  }

  updatePlaceCollectionLayer(collectionId, collection) {
    this.map
      .getSource(collectionId)
      .setData(this.createGeoJSONFromCollection(collection));
  }

  addPlaceCollectionLayer(collectionId, collection) {
    this.layers[collectionId] = this.map.createPlaceLayer(
      {
        id: collectionId,
        rules: this.mapConfig.layers.find(layer => layer.id === collectionId)
          .rules,
      },
      this.createGeoJSONFromCollection(collection),
    );
    this.map.addGeoJSONLayer(this.layers[collectionId]);

    // Bind map interaction events.
    // TODO: hover cursor
    this.layers[collectionId].forEach(layer => {
      ["symbol", "fill", "line"].forEach(layerGeometryType => {
        this.map.onLayerEvent(
          "click",
          `${layer.id}_${layerGeometryType}`,
          evt => {
            // We query rendered features here to obtain a single array of layers
            // below the clicked-on point. The first entry in this array
            // corresponds to the topmost rendered feature.
            const properties = this.map.queryRenderedFeatures(
              [evt.point.x, evt.point.y],
              {
                // Limit these click listeners to place geometry
                filter: ["==", ["get", "type"], "place"],
              },
            )[0].properties;
            const geometry = evt.features[0].geometry;

            Util.log("USER", "map", "place-marker-click");

            if (properties["url-title"]) {
              this.router.navigate("/" + properties["url-title"], {
                trigger: true,
              });
            } else {
              this.router.navigate(
                "/" + properties["datasetSlug"] + "/" + properties.id,
                { trigger: true },
              );
            }

            // TODO: Move to AppView
            if (geometry.type === "Polygon" || geometry.type === "LineString") {
              // Fit to bounds
              // https://www.mapbox.com/mapbox-gl-js/example/zoomto-linestring
              const bounds = geometry.coordinates.reduce(
                (bounds, coord) => bounds.extend(coord),
                this.map.makeLngLatBounds(
                  geometry.coordinates[0],
                  geometry.coordinates[0],
                ),
              );
              this.map.fitBounds(bounds, { padding: 30 });
            } else if (geometry.type === "Point") {
              this.map.easeTo({
                center: geometry.coordinates,
              });
            }
          },
        );
      });
    });
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

  // TODO: Layer loading and error events.
  async createLayerFromConfig(config) {
    if (!config.type) {
      return;
    }

    if (config.type === "mapbox-style") {
      this.map.addMapboxStyle(config.url);
    } else if (config.type === "raster-tile") {
      this.layers[config.id] = this.map.createRasterTileLayer(config);
      this.map.addLayer(this.layers[config.id]);
    } else if (config.type === "wms") {
      this.layers[config.id] = this.map.createWMSLayer(config);
      this.map.addLayer(this.layers[config.id]);
    } else if (config.type === "wmts") {
      this.layers[config.id] = this.map.createWMTSLayer(config);
      this.map.addLayer(this.layers[config.id]);
    } else if (config.type === "vector-tile") {
      const vectorLayerGroupConfig = await this.map.createVectorTileLayer(
        config,
      );
      this.layers[config.id] = vectorLayerGroupConfig;
      this.map.addVectorLayerGroup(this.layers[config.id]);
    } else if (config.type === "json") {
      this.layers[config.id] = this.map.createGeoJSONLayer(config);
      this.map.addGeoJSONLayer(this.layers[config.id], config.geometry_type);
    }
  }
}

export default MainMap;
