var Util = require("../utils.js");

module.exports = Backbone.View.extend({
  // A view responsible for the representation of a place on the map.
  initialize: function() {
    this.map = this.options.map;
    this.isFocused = false;
    this.isEditing = false;
    this.layerIsAdminControlled = Util.getAdminStatus(
      this.model.get("datasetId"),
    );
    this.throttledRender = _.throttle(this.render, 300);
    this.layerGroup = this.options.layerGroup;
    this.placeType = this.options.placeTypes[this.model.get("location_type")];
    this.styleRuleContext = {};
    this.styleRules = [];
    this.zoomRules = [];
    this.isHiddenByFilters = false;

    this.model.on(
      "change",
      function() {
        this.createLayer();
        this.render();
      },
      this,
    );
    this.model.on("focus", this.focus, this);
    this.model.on("unfocus", this.unfocus, this);
    this.model.on("destroy", this.onDestroy, this);
    this.model.on("userHideModel", this.onDestroy, this);

    if (!this.options.mapView.options.mapConfig.suppress_zoom_rules) {
      this.map.on("zoomend", this.render, this);
    }

    // Create arrays of functions representing parsed versions of style rules
    // found in the config. This prevents us from having to re-parse each
    // style rule on every map zoom for every layer view.
    if (this.placeType) {
      _.each(
        this.placeType.rules,
        function(rule) {
          var fn = new Function(["return ", rule.condition, ";"].join(""));

          fn.props = {};

          _.each(
            rule,
            function(prop, key) {
              if (key === "style") {

                // If we have a style rule with a dedicated "style" object, (i.e.
                // for third-party GeoJSON polygon/linestring geometry), make sure
                // to build functions for each sub-rule in the style object.
                _.each(prop, function(styleProp, stylePropKey) {
                  if (_.isString(styleProp) && styleProp.startsWith("this.")) {
                    prop[stylePropKey] = new Function(["return ", styleProp, ";"].join(""));
                  } else {
                    prop[stylePropKey] = styleProp;
                  }
                });

                fn.props[key] = prop;
              } else if (key !== "condition") {
                fn.props[key] = prop;
              }
            },
            this,
          );

          this.styleRules.push(fn);
        },
        this,
      );

      if (this.placeType.hasOwnProperty("zoomType")) {
        _.each(
          this.options.placeTypes[this.placeType.zoomType],
          function(rule) {
            var fn = new Function(["return ", rule.condition, ";"].join(""));

            fn.props = {};

            _.each(
              rule,
              function(prop, key) {
                if (key !== "condition") {
                  fn.props[key] = prop;
                }
              },
              this,
            );

            this.zoomRules.push(fn);
          },
          this,
        );
      }
    }

    this.evaluateStyleAndZoomRules();
    this.createLayer();
    this.render();
  },
  onZoomEnd: function() {
    this.render();
  },
  onMoveEnd: function() {
    this.throttledRender();
  },
  evaluateStyleAndZoomRules: function() {
    this.styleRulesWereUpdated = true;

    var styleRule = {},
      zoomRule = {},
      styleRuleContext = _.extend(
        {},
        this.model.toJSON(),
        { map: { zoom: this.map.getZoom() } },
        { layer: { focused: this.isFocused } },
      );

    for (var i = 0; i < this.styleRules.length; i++) {
      if (this.styleRules[i].apply(styleRuleContext)) {
        styleRule = this.styleRules[i].props;

        if (styleRule.style) {

          // Apply nested style object sub-rules if necessary
          styleRule.style = _.extend({}, styleRule.style);
          _.each(styleRule.style, function(rule, key) {
            styleRule.style[key] = (_.isFunction(rule)) ? rule.apply(styleRuleContext) : rule;
          }, this);
        }

        break;
      }
    }

    for (var i = 0; i < this.zoomRules.length; i++) {
      if (this.zoomRules[i].apply(styleRuleContext)) {
        zoomRule = this.zoomRules[i].props;
        break;
      }
    }

    this.styleRule = styleRule;
    this.zoomRule = zoomRule;

    if (this.styleRule.icon) {
      _.extend(this.styleRule.icon, this.zoomRule.icon);
    }
  },

  createLayer: function() {
    this.removeLayer();

    // Handle if an existing place type does not match the list of available
    // place types.
    this.placeType = this.options.placeTypes[this.model.get('location_type')];

    if (!this.placeType) {
      console.warn(
        "Place type",
        this.model.get("location_type"),
        "is not configured so it will not appear on the map.",
      );
      return;
    }

    // Don't draw new places. They are shown by the centerpoint in the app view
    if (!this.model.isNew() && this.isPublishable()) {
      // Construct an appropriate layer based on the model geometry and the
      // style rule. If the place is focused, use the 'focus_' portion of
      // the style rule if it exists.
      var geom = this.model.get("geometry");
      if (geom.type === "Point") {
        this.latLng = L.latLng(geom.coordinates[1], geom.coordinates[0]);

        // If we've saved an icon url in the model, use that
        if (this.model.get("style") && this.model.get("style").iconUrl) {
          this.styleRule.icon.iconUrl = this.model.get("style").iconUrl;
        }

        if (this.hasIcon()) {
          this.layer = this.isFocused && this.styleRule.focus_icon
            ? L.marker(this.latLng, { icon: L.icon(this.styleRule.focus_icon) })
            : L.marker(this.latLng, { icon: L.icon(this.styleRule.icon) });
        } else if (this.hasStyle()) {
          this.layer = this.isFocused && this.styleRule.focus_style
            ? L.circleMarker(this.latLng, this.styleRule.focus_style)
            : L.circleMarker(this.latLng, this.styleRule.style);
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
        this.layer.getLocationType = this.getLocationType.bind(this);
        this.layer.on("click", this.onMarkerClick, this);
      }
    }
  },
  isPublishable: function() {
    if (this.layerIsAdminControlled) {
      return true;
    }

    return (
      !this.model.get("published") ||
      this.model.get("published") !== "isNotPublished"
    );
  },
  onDestroy: function() {
    // NOTE: it's necessary to remove the zoomend event here
    // so this view won't try to recreate a marker when the map is
    // zoomed. Somehow even when a layer view is removed, the
    // zoomend listener on the map still retains a reference to it
    // and is capable of calling view methods on a "deleted" view.
    this.map.off("zoomend", this.render, this);
  },
  removeLayer: function() {
    if (this.layer) {
      this.layerGroup.removeLayer(this.layer);
    }
  },
  render: function() {
    if (!this.isEditing && this.layer) {
      this.updateLayer();
    } else {
      this.hide();
    }
  },
  updateLayer: function() {
    this.evaluateStyleAndZoomRules();
    this.createLayer();
    this.show();
  },
  onMarkerClick: function() {
    Util.log(
      "USER",
      "map",
      "place-marker-click",
      this.model.getLoggingDetails(),
    );
    // support places with landmark-style urls
    if (this.model.get("url-title")) {
      this.options.router.navigate("/" + this.model.get("url-title"), {
        trigger: true,
      });
    } else {
      this.options.router.navigate(
        "/" + this.model.get("datasetSlug") + "/" + this.model.id,
        { trigger: true },
      );
    }
  },
  isPoint: function() {
    return this.model.get("geometry").type == "Point";
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
      this.render();
    }
  },
  unfocus: function() {
    if (this.isFocused) {
      this.isFocused = false;
      this.render();
    }
  },
  remove: function() {
    this.removeLayer();
    this.map.off("move", this.throttledRender, this);
  },
  setIcon: function(icon) {
    if (this.layer) {
      this.layer.setIcon(icon);
    }
  },
  getLocationType: function() {
    return this.model.get("location_type");
  },
  filter: function() {
    this.isHiddenByFilters = true;
    this.hide();
  },
  unfilter: function() {
    this.isHiddenByFilters = false;
    this.show();
  },
  show: function() {
    if (!this.isHiddenByFilters && this.layer) {
      this.layerGroup.addLayer(this.layer);
    } else {
      this.hide();
    }
  },
  hide: function() {
    this.removeLayer();
  }
});
