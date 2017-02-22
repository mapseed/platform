var Shareabouts = Shareabouts || {};

(function(S, $, console) {
  S.GeometryEditorView = Backbone.View.extend({
    events: {},
    initialize: function() {
      var self = this;

      this.map = this.options.map;
      this.editingLayerGroup = new L.FeatureGroup();
      this.DRAWING_DEFAULTS = {
        color: "#f06eaa",
        opacity: 0.5,
        fillColor: "#f06eaa",
        fillOpacity: 0.2,
        fill: {
          color: "fillColor",
          opacity: "fillOpacity"
        },
        stroke: {
          color: "color",
          opacity: "opacity"
        }
      };
      this.priorColorData = {
        color: this.DRAWING_DEFAULTS.color,
        opacity: this.DRAWING_DEFAULTS.opacity,
        fillColor: this.DRAWING_DEFAULTS.fillColor,
        fillOpacity: this.DRAWING_DEFAULTS.fillOpacity
      };
      this.drawControl = new L.Control.Draw({
        position: "bottomright",
        edit: false,
        draw: {
          circle: false,
          marker: false,
          polygon: {
            shapeOptions: {
              color: this.DRAWING_DEFAULTS.color,
              opacity: this.DRAWING_DEFAULTS.opacity,
              fillColor: this.DRAWING_DEFAULTS.fillColor,
              fillOpacity: this.DRAWING_DEFAULTS.fillOpacity
            }
          },
          rectangle: {
            shapeOptions: {
              color: this.DRAWING_DEFAULTS.color,
              opacity: this.DRAWING_DEFAULTS.opacity,
              fillColor: this.DRAWING_DEFAULTS.fillColor,
              fillOpacity: this.DRAWING_DEFAULTS.fillOpacity
            }
          },
          polyline: {
            shapeOptions: {
              color: this.DRAWING_DEFAULTS.color,
              opacity: this.DRAWING_DEFAULTS.opacity
            }
          }
        }
      });
      this.drawControlEditOnly = new L.Control.Draw({
        position: "bottomright",
        edit: {
          featureGroup: this.editingLayerGroup,
          edit: {
            selectedPathOptions: {
              maintainColor: true
            }
          },
          remove: true
        },
        draw: false
      });
      this.drawControlEditOnlyNoRemove = new L.Control.Draw({
        position: "bottomright",
        edit: {
          featureGroup: this.editingLayerGroup,
          edit: {
            selectedPathOptions: {
              maintainColor: true
            }
          },
          remove: false
        },
        draw: false
      });

      var colorpickerControl = L.Control.extend({
        options: {
          position: "bottomright",
        },
        editMode: "fill",
        color: this.DRAWING_DEFAULTS.color,
        opacity: this.DRAWING_DEFAULTS.opacity,
        fillColor: this.DRAWING_DEFAULTS.fillColor,
        fillOpacity: this.DRAWING_DEFAULTS.fillOpacity,
        onAdd: function(map) {
          var controlDiv = L.DomUtil.create('div', 'leaflet-control-colorpicker');
          L.DomEvent
            .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
            .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
            .addListener(controlDiv, 'click', function() {
              $(".sp-picker-container").css("display", ($(".sp-picker-container").is(":visible") ? "none" : "block"));
            });
          var controlUI = L.DomUtil.create('div', 'leaflet-control-colorpicker-interior', controlDiv);
          controlUI.title = 'Map ColorPicker';
          return controlDiv;
        }
      });
      $(".leaflet-control-colorpicker, .sp-picker-container").remove();
      this.colorpicker = new colorpickerControl;
      this.addControl(this.colorpicker);

      $(".leaflet-control-colorpicker").spectrum({
        flat: true,
        showButtons: false,
        showInput: true,
        showAlpha: true,
        // convert to rgba() format
        color: tinycolor(self.colorpicker.fillColor).setAlpha(self.colorpicker.fillOpacity).toRgbString(),
        move: function(color) {
          if (self.placeDetailView) {
            self.placeDetailView.onModified();
          }
          if (self.editingLayerGroup.getLayers().length > 0) {
            if (self.colorpicker.editMode === "fill") {
              self.editingLayerGroup.getLayers()[0].setStyle({
                fillColor: color.toHexString(),
                fillOpacity: color.getAlpha()
              });
              self.colorpicker.fillColor = color.toHexString();
              self.colorpicker.fillOpacity = color.getAlpha();
            } else if (self.colorpicker.editMode === "stroke") {
              self.editingLayerGroup.getLayers()[0].setStyle({
                color: color.toHexString(),
                opacity: color.getAlpha()
              });
              self.colorpicker.color = color.toHexString();
              self.colorpicker.opacity = color.getAlpha();
            }
          }
        },
        change: function() {
          //console.log("color change");
        }
      });

      $(".sp-picker-container")
        .css("display", "none")
        .prepend("<button type='button' class='sp-choose sp-selected' x-edit-mode='fill'>Fill</button>" +
          "<button type='button' class='sp-choose' x-edit-mode='stroke'>Stroke</button>");

      $(".sp-choose").on("click", function() {
        $(this)
          .addClass("sp-selected")
          .siblings()
          .removeClass("sp-selected");
        self.colorpicker.editMode = $(this).attr("x-edit-mode");
        $(".leaflet-control-colorpicker").spectrum("set",
          tinycolor(self.colorpicker[self.DRAWING_DEFAULTS[$(this).attr("x-edit-mode")].color])
            .setAlpha(self.colorpicker[self.DRAWING_DEFAULTS[$(this).attr("x-edit-mode")].opacity]).toRgbString());
      });

      var generateGeometry = function(layer) {
        var buildCoords = function(layer) {
          var coordinates = [],
          latLngs = layer.getLatLngs();
          for (var i = 0; i < latLngs.length; i++) {
            coordinates.push([latLngs[i].lng, latLngs[i].lat]);
          }

          return coordinates;
        };

        if (self.geometryType === "polygon" 
          || self.geometryType === "rectangle"
          || self.geometryType === "Polygon") {
          var coordinates = buildCoords(layer),
          latLngs = layer.getLatLngs();
          // make sure the final polygon vertex exactly matches the first
          coordinates.push([latLngs[0].lng, latLngs[0].lat]);
          self.geometry = {
            "type": "Polygon",
            "coordinates": [coordinates]
          }
        } else if (self.geometryType === "polyline"
          || self.geometryType === "LineString") {
          var coordinates = buildCoords(layer);
          self.geometry = {
            "type": "LineString",
            "coordinates": coordinates
          }
        }
      }
     
      this.map.on("draw:deleted", function(e) {
        if (self.editingLayerGroup.getLayers().length == 0) {
          $(".leaflet-control-colorpicker").css("display", "none");
          self.removeControl(self.drawControlEditOnly);
          self.addControl(self.drawControl);
        }
      });

      this.map.on("draw:created", function(e) {
        self.geometryType = e.layerType;
        generateGeometry(e.layer);
        self.editingLayerGroup.addLayer(e.layer);
        self.removeControl(self.drawControl);
        self.addControl(self.drawControlEditOnly);
        $(".leaflet-control-colorpicker").css("display", "block");
      });

      this.map.on("draw:edited", function(e) {
        e.layers.eachLayer(function(layer) {
          // really there's only one layer to iterate over
          generateGeometry(layer);
        });

        // if we're in editor mode, trigger a save to the server when
        // the editor toolbar save button is clicked
        if (!self.options.isCreatingNewGeometry && self.placeDetailView) {
          self.placeDetailView.isModified = true;
          self.placeDetailView.onUpdateModel();
        }
      });

      return this;
    },

    setColorpicker: function(styles) {
      var styles = styles || {};
      this.colorpicker.color = styles.color || this.DRAWING_DEFAULTS.color;
      this.colorpicker.opacity = styles.opacity || this.DRAWING_DEFAULTS.opacity;
      this.colorpicker.fillColor = styles.fillColor || this.DRAWING_DEFAULTS.fillColor;
      this.colorpicker.fillOpacity = styles.fillOpacity || this.DRAWING_DEFAULTS.fillOpacity;
      this.colorpicker.editMode = "fill";
      $(".sp-choose[x-edit-mode='fill']")
        .addClass("sp-selected")
        .siblings()
        .removeClass("sp-selected");
      $(".leaflet-control-colorpicker").spectrum("set", 
        tinycolor(this.colorpicker.fillColor)
          .setAlpha(this.colorpicker.fillOpacity).toRgbString());
    },

    render: function(args) {
      this.options.router.on("route", this.tearDown, this);
      this.addLayerToMap(this.editingLayerGroup);
      if (!args.isCreatingNewGeometry) {
        this.isCreatingNewGeometry = args.isCreatingNewGeometry;
        this.setColorpicker(args.style);
        this.geometryType = args.geometryType;
        this.changeLayerGroup(args.existingLayer, args.existingLayerGroup,
          this.editingLayerGroup);
        this.placeDetailView = args.placeDetailView;
        this.addControl(this.drawControlEditOnlyNoRemove);
        $(".leaflet-control-colorpicker").css("display", "block");
      } else {
        this.setColorpicker();
        this.addControl(this.drawControl);
      }
    },

    mapHasControl: function(control) {
      if (control && control._map) {
        return true;
      }

      return false;
    },

    addControl: function(control) {
      if (!this.mapHasControl(control)) {
        this.map.addControl(control);
      }
    },

    removeControl: function(control) {
      if (this.mapHasControl(control)) {
        this.map.removeControl(control);
      }
    },

    addLayerToMap: function(layer) {
      if (!this.map.hasLayer(layer)) {
        this.map.addLayer(layer);
      }
    },

    removeLayerFromMap: function(layer) {
      if (layer) {
        this.map.removeLayer(layer);
      }
    },

    changeLayerGroup: function(layer, sourceLayerGroup, targetLayerGroup) {
      sourceLayerGroup.removeLayer(layer);
      targetLayerGroup.addLayer(layer);
    },

    tearDown: function() {
      var self = this;
      this.options.router.off("route", this.tearDown, this);
      this.editingLayerGroup.getLayers().forEach(function(layer) {
        self.editingLayerGroup.removeLayer(layer);
      });
      this.removeLayerFromMap(this.editingLayerGroup);
      this.removeControl(this.drawControl);
      this.removeControl(this.drawControlEditOnly);
      this.removeControl(this.drawControlEditOnlyNoRemove);
      $(".leaflet-control-colorpicker").css("display", "none");
      $(".sp-picker-container").css("display", "none");
    }
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
