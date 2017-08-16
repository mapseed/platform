/* A view enabling the creation and editing of geometry layers */

module.exports = Backbone.View.extend({
  events: {
    "click .create-marker": "onClickCreateMarker",
    "click .create-polyline": "onClickCreatePolyline",
    "click .create-polygon": "onClickCreatePolygon",
    "click .edit-geometry": "onClickEditGeometry",
    "click .delete-geometry": "onClickDeleteGeometry",
    "click .colorpicker": "onClickColorpicker",
    "change input[name='geometry']": "onIconSelection",
  },
  canonicalGeometryNames: {
    marker: "Point",
    polygon: "Polygon",
    polyline: "LineString",
  },
  initialize: function() {
    var self = this;

    this.map = this.options.map;
    this.workingGeometry = null;
    this.numVertices = 0;
    this.layerType = null;
    this.iconUrl = null;
    this.existingLayerView = null;
    this.isEditing = false;
    this.editingLayerGroup = new L.FeatureGroup();
    this.DRAWING_DEFAULTS = {
      color: "#f86767",
      opacity: 0.7,
      fillColor: "#f1f075",
      fillOpacity: 0.3,
      fill: {
        color: "fillColor",
        opacity: "fillOpacity",
      },
      stroke: {
        color: "color",
        opacity: "opacity",
      },
    };
    this.colorpickerSettings = {
      editMode: "fill",
      color: this.DRAWING_DEFAULTS.color,
      opacity: this.DRAWING_DEFAULTS.opacity,
      fillColor: this.DRAWING_DEFAULTS.fillColor,
      fillOpacity: this.DRAWING_DEFAULTS.fillOpacity,
    };

    // Init the colorpicker
    $("body").append(Handlebars.templates["colorpicker-container"]());
    $(".toolbar-colorpicker-container").spectrum({
      flat: true,
      showButtons: false,
      showInput: true,
      showAlpha: true,

      // Convert to rgba() format
      color: tinycolor(self.colorpickerSettings.fillColor)
        .setAlpha(self.colorpickerSettings.fillOpacity)
        .toRgbString(),
      move: function(color) {
        if (self.placeDetailView) {
          self.placeDetailView.onModified();
        }
        if (self.editingLayerGroup.getLayers().length > 0) {
          if (self.colorpickerSettings.editMode === "fill") {
            self.editingLayerGroup.getLayers()[0].setStyle({
              fillColor: color.toHexString(),
              fillOpacity: color.getAlpha(),
            });
            self.colorpickerSettings.fillColor = color.toHexString();
            self.colorpickerSettings.fillOpacity = color.getAlpha();
          } else if (self.colorpickerSettings.editMode === "stroke") {
            self.editingLayerGroup.getLayers()[0].setStyle({
              color: color.toHexString(),
              opacity: color.getAlpha(),
            });
            self.colorpickerSettings.color = color.toHexString();
            self.colorpickerSettings.opacity = color.getAlpha();
          }
        }
      },
    });

    $(".sp-picker-container")
      .addClass("hidden")
      .prepend(Handlebars.templates["colorpicker-controls"]());

    $(".sp-choose").on("click", function(evt) {
      self.onClickColorEditModeChange(evt);
    });

    // ========== Drawing events ==========
    this.map.on("draw:drawvertex", function(evt) {
      self.numVertices++;

      if (self.layerType === "Polygon" && self.numVertices <= 2) {
        self.displayHelpMessage("draw-polygon-continue-msg");
      } else if (self.layerType === "Polygon" && self.numVertices > 2) {
        self.displayHelpMessage("draw-polygon-finish-msg");
      } else if (self.layerType === "LineString" && self.numVertices === 1) {
        self.displayHelpMessage("draw-polyline-continue-msg");
      } else if (self.layerType === "LineString" && self.numVertices > 1) {
        self.displayHelpMessage("draw-polyline-finish-msg");
      }
    });

    this.map.on("draw:created", function(evt) {
      self.resetWorkingGeometry();
      self.setColorpicker();
      self.hideIconToolbar();

      self.layerType = self.canonicalGeometryNames[evt.layerType];
      self.generateGeometry(evt.layer);
      self.editingLayerGroup.addLayer(evt.layer);
      self.swapToolbarVisibility();
      self.displayHelpMessage("modify-geometry-msg");
    });

    this.map.on("draw:editvertex", function(evt) {
      if (self.placeDetailView) {
        self.placeDetailView.onModified();
      }
    });

    this.map.on("draw:editmove", function(evt) {
      if (self.placeDetailView) {
        self.placeDetailView.onModified();
      }
    });

    this.map.on("draw:edited", function(evt) {
      evt.layers.eachLayer(function(layer) {
        self.generateGeometry(layer);
      });
    });

    return this;
  },

  buildCoords: function(latLngs) {
    return latLngs.map(function(pair) {
      return [pair.lng, pair.lat];
    });
  },

  generateGeometry: function(layer) {
    if (this.layerType === "Polygon") {
      var latLngs = layer.getLatLngs(),
        coordinates = this.buildCoords(latLngs);

      // Make sure the final polygon vertex exactly matches the first. The
      // database will reject polygonal geometry otherwise.
      coordinates.push([latLngs[0].lng, latLngs[0].lat]);
      this.geometry = {
        type: "Polygon",
        coordinates: [coordinates],
      };
    } else if (this.layerType === "LineString") {
      var coordinates = this.buildCoords(layer.getLatLngs());
      this.geometry = {
        type: "LineString",
        coordinates: coordinates,
      };
    } else if (this.layerType === "Point") {
      this.geometry = {
        type: "Point",
        coordinates: [layer._latlng.lng, layer._latlng.lat],
      };
    }
  },

  // ========== Toolbar handlers ==========
  onClickColorEditModeChange: function(evt) {
    evt.preventDefault();

    var editMode = $(evt.target).data("edit-mode");

    $(evt.target).addClass("sp-selected").siblings().removeClass("sp-selected");

    this.colorpickerSettings.editMode = editMode;
    this.updateColorpicker();
  },

  onClickColorpicker: function(evt) {
    evt.preventDefault();

    this.saveWorkingGeometry();
    this.disableWorkingGeometry();
    this.updateColorpicker();
    $("#content article")
      .off("srcoll", this.repositionColorpicker)
      .scroll(this.repositionColorpicker);
    $(window)
      .off("resize", this.repositionColorpicker)
      .resize(this.repositionColorpicker)
      .trigger("resize");
    $(".sp-picker-container").toggleClass("hidden");
    this.setGeometryToolbarHighlighting(evt.currentTarget);
    this.setDefaultCursor();
    this.isEditing = false;
  },

  repositionColorpicker: function() {
    $(".sp-container").css({
      left: $("button.colorpicker").offset().left - 40 + "px",
      top: $("button.colorpicker").offset().top - 5 + "px",
    });
  },

  onClickCreateMarker: function(evt) {
    evt.preventDefault();

    // Prevent repeat clicks on the same geometry drawing tool
    if (this.layerType === "Point") return;

    this.iconUrl = this.$el
      .find(".geometry-toolbar-icon-field input:checked")
      .val();

    // NOTE: Creation of Markers is handled differently from polygons and polylines.
    // We place the marker directly on the map and jump immediately into edit mode.
    L.marker(this.map.getCenter(), {
      icon: new L.icon({
        iconUrl: this.iconUrl,

        // NOTE: these icon parameters are suitable for round icons
        // TODO: make this configurable
        iconSize: [25, 25],
        iconAnchor: [12.5, 12.5],
      }),
    }).addTo(this.editingLayerGroup);

    this.layerType = "Point";
    this.resetWorkingGeometry();
    this.generateGeometry(this.getLayerFromEditingLayerGroup());
    this.setColorpicker();
    this.swapToolbarVisibility();
    this.displayHelpMessage("edit-marker-geometry-msg");
  },

  onClickCreatePolyline: function(evt) {
    evt.preventDefault();

    // Prevent repeat clicks on the same geometry drawing tool
    if (this.layerType === "LineString") return;

    this.resetWorkingGeometry();

    this.workingGeometry = new L.Draw.Polyline(this.map, {
      shapeOptions: {
        color: this.DRAWING_DEFAULTS.color,
        opacity: this.DRAWING_DEFAULTS.opacity,
      },
    });
    this.workingGeometry.enable();

    this.numVertices = 0;
    this.layerType = "LineString";
    this.hideIconToolbar();
    this.setGeometryToolbarHighlighting(evt.currentTarget);
    this.displayHelpMessage("draw-poly-geometry-start-msg");
    this.updateButtonText(this.layerType);
    this.setEditingCursor();
    this.isEditing = false;
  },

  onClickCreatePolygon: function(evt) {
    evt.preventDefault();

    // Prevent repeat clicks on the same geometry drawing tool
    if (this.layerType === "Polygon") return;

    this.resetWorkingGeometry();

    this.workingGeometry = new L.Draw.Polygon(this.map, {
      shapeOptions: {
        color: this.DRAWING_DEFAULTS.color,
        opacity: this.DRAWING_DEFAULTS.opacity,
        fillColor: this.DRAWING_DEFAULTS.fillColor,
        fillOpacity: this.DRAWING_DEFAULTS.fillOpacity,
      },
    });
    this.workingGeometry.enable();

    this.numVertices = 0;
    this.layerType = "Polygon";
    this.hideIconToolbar();
    this.setGeometryToolbarHighlighting(evt.currentTarget);
    this.displayHelpMessage("draw-poly-geometry-start-msg");
    this.updateButtonText(this.layerType);
    this.setEditingCursor();
    this.isEditing = false;
  },

  onClickEditGeometry: function(evt) {
    evt.preventDefault();

    if (this.workingGeometry) {
      // If the user clicks the edit button while editing, we commit the edited
      // changes and disable editing
      this.workingGeometry.save();
      this.resetWorkingGeometry();
      this.setGeometryToolbarHighlighting(evt.currentTarget);
      this.displayHelpMessage("modify-geometry-msg");
      this.updateButtonText(this.layerType);
      this.setDefaultCursor();
      this.hideIconToolbar();
      this.hideColorpicker();
      this.isEditing = false;
    } else {
      this.workingGeometry = new L.EditToolbar.Edit(this.map, {
        featureGroup: this.editingLayerGroup,
      });
      this.workingGeometry.enable();
      if (this.layerType === "Point") {
        this.showIconToolbar();
        this.displayHelpMessage("edit-marker-geometry-msg");
      } else {
        this.displayHelpMessage("edit-poly-geometry-msg");
      }
      this.setGeometryToolbarHighlighting(evt.currentTarget);
      this.updateButtonText(this.layerType);
      this.hideColorpicker();
      this.isEditing = true;
    }
  },

  onClickDeleteGeometry: function(evt) {
    evt.preventDefault();

    var self = this;

    self.editingLayerGroup.eachLayer(function(layer) {
      self.editingLayerGroup.removeLayer(layer);
    });

    this.swapToolbarVisibility();
    this.layerType = null;
    this.resetWorkingGeometry();
    this.displayHelpMessage("create-new-geometry-msg");
    this.hideColorpicker();
    this.hideIconToolbar();
    this.resetGeometryToolbarHighlighting();
    this.setDefaultCursor();
    this.isEditing = false;
  },

  onIconSelection: function(evt) {
    this.iconUrl = this.$el
      .find(".geometry-toolbar-icon-field input:checked")
      .val();
    var icon = L.icon({
      iconUrl: this.iconUrl,

      // NOTE: these icon parameters are suitable for round icons
      // TODO: make this configurable
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5],
    });

    if (this.isEditing) {
      this.workingGeometry.save();
      this.disableWorkingGeometry();
      this.getLayerFromEditingLayerGroup().setIcon(icon);
      this.buildWorkingGeometry();
      this.workingGeometry.enable();
    } else {
      this.workingGeometry.options.icon.options.iconUrl = this.iconUrl;
      if (this.workingGeometry._marker) {
        this.workingGeometry._marker.setIcon(icon);
      }
    }
  },

  // ========== Helpers ==========
  setColorpicker: function(styles) {
    var styles = styles || {};
    this.colorpickerSettings.color =
      styles.color || this.DRAWING_DEFAULTS.color;
    this.colorpickerSettings.opacity =
      styles.opacity || this.DRAWING_DEFAULTS.opacity;
    this.colorpickerSettings.fillColor =
      styles.fillColor || this.DRAWING_DEFAULTS.fillColor;
    this.colorpickerSettings.fillOpacity =
      styles.fillOpacity || this.DRAWING_DEFAULTS.fillOpacity;
    this.colorpickerSettings.editMode = "fill";
    $(".sp-choose[data-edit-mode='fill']")
      .addClass("sp-selected")
      .siblings()
      .removeClass("sp-selected");
    $(".leaflet-control-colorpicker").spectrum(
      "set",
      tinycolor(this.colorpickerSettings.fillColor)
        .setAlpha(this.colorpickerSettings.fillOpacity)
        .toRgbString(),
    );
  },

  hideColorpicker: function() {
    $(".sp-picker-container").addClass("hidden");
  },

  resetWorkingGeometry: function() {
    if (this.workingGeometry) {
      this.workingGeometry.disable();
      this.workingGeometry = null;
      this.geometry = null;
    }
  },

  disableWorkingGeometry: function() {
    if (this.workingGeometry) {
      this.workingGeometry.disable();
      this.workingGeometry = null;
    }
  },

  updateColorpicker: function() {
    $(".toolbar-colorpicker-container").spectrum(
      "set",
      tinycolor(
        this.colorpickerSettings[
          this.DRAWING_DEFAULTS[this.colorpickerSettings.editMode].color
        ],
      )
        .setAlpha(
          this.colorpickerSettings[
            this.DRAWING_DEFAULTS[this.colorpickerSettings.editMode].opacity
          ],
        )
        .toRgbString(),
    );
  },

  saveWorkingGeometry: function() {
    if (this.workingGeometry) {
      this.workingGeometry.save();
    } else {
      this.buildWorkingGeometry();
      this.workingGeometry.save();
    }
  },

  buildWorkingGeometry: function() {
    this.workingGeometry = new L.EditToolbar.Edit(this.map, {
      featureGroup: this.editingLayerGroup,
    });
  },

  displayHelpMessage: function(msg) {
    this.$el
      .find(".helper-messages ." + msg)
      .removeClass("hidden")
      .siblings()
      .addClass("hidden");
  },

  updateButtonText: function(type) {
    this.$el
      .find(".delete-geometry-" + type)
      .removeClass("hidden")
      .siblings()
      .not("img")
      .addClass("hidden");

    this.$el
      .find(".edit-geometry-" + type)
      .removeClass("hidden")
      .siblings()
      .not("img")
      .addClass("hidden");
  },

  showIconToolbar: function() {
    this.$el.find(".geometry-toolbar-icon-field").removeClass("hidden");
  },

  setIconToolbarIcon: function() {
    this.$el
      .find(".geometry-toolbar-icon-field :input[value='" + this.iconUrl + "']")
      .prop("checked", true);
  },

  hideIconToolbar: function() {
    this.$el.find(".geometry-toolbar-icon-field").addClass("hidden");
  },

  setGeometryToolbarHighlighting: function(currentTarget) {
    var target = this.$el.find(currentTarget);

    target.toggleClass("selected").siblings().removeClass("selected");
  },

  swapToolbarVisibility: function() {
    this.$geometryToolbarEdit.toggleClass("hidden");
    this.$geometryToolbarCreate.toggleClass("hidden");

    if (this.layerType === "Point") {
      this.$geometryToolbarEdit.find(".colorpicker").addClass("hidden");
    } else {
      this.$geometryToolbarEdit.find(".colorpicker").removeClass("hidden");
    }

    this.resetGeometryToolbarHighlighting();

    if (!this.$geometryToolbarEdit.hasClass("hidden")) {
      this.$el.find(".edit-geometry").trigger("click");
    }
  },

  resetGeometryToolbarHighlighting: function() {
    this.$el.find(".geometry-toolbar button").removeClass("selected");
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

  setEditingCursor: function() {
    $(".leaflet-container").addClass("add-edit-cursor");
  },

  setDefaultCursor: function() {
    $(".leaflet-container").removeClass("add-edit-cursor");
  },

  getLayerFromEditingLayerGroup: function() {
    var returnLayers = [];

    // NOTE: we make an assumption here that our workingGeometry is a layer
    // group with only one layer in it, so the iteration below will return a
    // single layer. In case there are more layers in the editingLayerGroup for
    // some reason, we only return the first layer found.
    this.editingLayerGroup.eachLayer(function(layer) {
      returnLayers.push(layer);
    });

    return returnLayers[0];
  },

  // ========== Render and tear down ==========
  render: function(args) {
    // If we route away from the view containing this geometry editor, be
    // sure to tear the geometry editor down
    this.options.router.on("route", this.tearDown, this);

    this.$el = args.$el;

    // Cache toolbar elements
    this.$geometryToolbarCreate = this.$el.find(".geometry-toolbar-create");
    this.$geometryToolbarEdit = this.$el.find(".geometry-toolbar-edit");

    this.addLayerToMap(this.editingLayerGroup);

    this.delegateEvents();

    if (args.existingLayerView) {
      this.existingLayerView = args.existingLayerView;
      this.setColorpicker(args.style);
      this.changeLayerGroup(
        this.existingLayerView.layer,
        this.existingLayerView.layerGroup,
        this.editingLayerGroup,
      );
      this.layerType = args.layerType;
      this.placeDetailView = args.placeDetailView;
      this.existingLayerView.isEditing = true;
      this.swapToolbarVisibility();
      this.iconUrl = args.style.iconUrl;

      // Disable deleting geometry in edit mode
      this.$el.find(".delete-geometry").addClass("hidden");

      if (this.layerType === "Point") {
        this.showIconToolbar();
        this.setIconToolbarIcon();
      }
    } else {
      this.iconUrl = args.iconUrl;
      this.setColorpicker();
    }
  },

  tearDown: function() {
    var self = this;
    this.options.router.off("route", this.tearDown, this);
    $(window).off("resize", this.repositionColorpicker);
    $("#content article").off("scroll", this.repositionColorpicker);

    if (this.workingGeometry && this.workingGeometry.revertLayers) {
      this.workingGeometry.revertLayers();
    }

    this.resetWorkingGeometry();
    this.layerType = null;
    if (this.existingLayerView) {
      this.changeLayerGroup(
        this.existingLayerView.layer,
        this.editingLayerGroup,
        this.existingLayerView.layerGroup,
      );
      this.existingLayerView.isEditing = false;
      this.existingLayerView.updateLayer();
    }

    this.editingLayerGroup.getLayers().forEach(function(layer) {
      self.editingLayerGroup.removeLayer(layer);
    });

    this.removeLayerFromMap(this.editingLayerGroup);
    this.setDefaultCursor();

    $(".sp-picker-container").addClass("hidden");
  },
});
