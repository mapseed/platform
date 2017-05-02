/* A view enabling the creation and editing of geometry layers */

module.exports = Backbone.View.extend({
  events: {
    "click .create-marker": "onClickCreateMarker",
    "click .create-polyline": "onClickCreatePolyline",
    "click .create-polygon": "onClickCreatePolygon",
    "click .edit-geometry": "onClickEditGeometry",
    "click .delete-geometry": "onClickDeleteGeometry",
    "click .colorpicker": "onClickColorpicker",
    "change input[name='geometry']": "onIconSelection"
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
    this.colorpickerSettings = {
      editMode: "fill",
      color: this.DRAWING_DEFAULTS.color,
      opacity: this.DRAWING_DEFAULTS.opacity,
      fillColor: this.DRAWING_DEFAULTS.fillColor,
      fillOpacity: this.DRAWING_DEFAULTS.fillOpacity
    };

    // Init the colorpicker
    $("body").append("<div class='toolbar-colorpicker-container'></div>");
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
              fillOpacity: color.getAlpha()
            });
            self.colorpickerSettings.fillColor = color.toHexString();
            self.colorpickerSettings.fillOpacity = color.getAlpha();
          } else if (self.colorpickerSettings.editMode === "stroke") {
            self.editingLayerGroup.getLayers()[0].setStyle({
              color: color.toHexString(),
              opacity: color.getAlpha()
            });
            self.colorpickerSettings.color = color.toHexString();
            self.colorpickerSettings.opacity = color.getAlpha();
          }
        }
      }
    });

    $(".sp-picker-container")
      .addClass("hidden")
      .prepend(Handlebars.templates["colorpicker-controls"]());

    $(".sp-choose").on("click", function(evt) {
      self.onClickColorEditModeChange(evt);
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

      if (self.geometryType === "polygon" ||
          self.geometryType === "rectangle" ||
          self.geometryType === "Polygon") {
        
        var coordinates = buildCoords(layer),
        latLngs = layer.getLatLngs();
        
        // Make sure the final polygon vertex exactly matches the first. The
        // database will reject polygonal geometry otherwise.
        coordinates.push([latLngs[0].lng, latLngs[0].lat]);
        self.geometry = {
          "type": "Polygon",
          "coordinates": [coordinates]
        }
      } else if (self.geometryType === "polyline" ||
          self.geometryType === "LineString") {
        
        var coordinates = buildCoords(layer);
        self.geometry = {
          "type": "LineString",
          "coordinates": coordinates
        }
      } else if (self.geometryType === "marker" ||
          self.geometryType === "Point") {

        self.geometry = {
          "type": "Point",
          "coordinates": [layer._latlng.lng, layer._latlng.lat]
        }
      }
    }

    // ========== Drawing events ==========
    this.map.on("draw:drawvertex", function(evt) {
      self.numVertices++;

      if (self.layerType === "polygon" && self.numVertices <= 2) {
        self.displayHelpMessage("draw-polygon-continue-msg");
      } else if (self.layerType === "polygon" && self.numVertices > 2) {
        self.displayHelpMessage("draw-polygon-finish-msg");
      } else if (self.layerType === "polyline" && self.numVertices === 1) {
        self.displayHelpMessage("draw-polyline-continue-msg");
      } else if (self.layerType === "polyline" && self.numVertices > 1) {
        self.displayHelpMessage("draw-polyline-finish-msg");
      }
    });

    this.map.on("draw:created", function(evt) {
      self.resetWorkingGeometry();
      self.setColorpicker();
      self.hideIconToolbar();

      self.geometryType = evt.layerType;
      generateGeometry(evt.layer);
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
        
        // Really there's only one layer to iterate over here, because we have at
        // most one layer in the editing layer group.
        generateGeometry(layer);
      });
    });

    return this;
  },

  // ========== Toolbar handlers ==========
  onClickColorEditModeChange: function(evt) {
    evt.preventDefault();

    var editMode = $(evt.target).data("edit-mode");

    $(evt.target)
      .addClass("sp-selected")
      .siblings()
      .removeClass("sp-selected");
    
    this.colorpickerSettings.editMode = editMode;
    this.updateColorpicker();
  },

  onClickColorpicker: function(evt) {
    evt.preventDefault();

    this.saveWorkingGeometry();
    this.updateColorpicker();
    $(".sp-container")
      .css("left", (evt.pageX - 100) + "px")
      .css("top", (evt.pageY + 30) + "px")
    $(".sp-picker-container").toggleClass("hidden");
    this.setGeometryToolbarHighlighting(evt.currentTarget);
    this.setDefaultCursor();
    this.isEditing = false;
  },

  onClickCreateMarker: function(evt) {
    evt.preventDefault();

    // Prevent repeat clicks on the same geometry drawing tool
    if (this.layerType === "marker") return;

    this.resetWorkingGeometry();
    this.showIconToolbar();
    this.iconUrl = this.$el.find(".geometry-toolbar-icon-field input:checked").val();

    this.workingGeometry = new L.Draw.Marker(this.map, {
      icon: new L.icon({
        iconUrl: this.iconUrl,
        
        // TODO: these hard-coded values won't work for all icon types...
        iconSize: [25, 25],
        iconAnchor: [12.5, 12.5]
      })
    });
    this.workingGeometry.enable();

    this.layerType = "marker";
    this.setGeometryToolbarHighlighting(evt.currentTarget);
    this.displayHelpMessage("draw-marker-geometry-msg");
    this.setEditingCursor();
    this.delegateEvents();
    this.isEditing = false;
  },

  onClickCreatePolyline: function(evt) {
    evt.preventDefault();

    // Prevent repeat clicks on the same geometry drawing tool
    if (this.layerType === "polyline") return;

    this.resetWorkingGeometry();

    this.workingGeometry = new L.Draw.Polyline(this.map, {
      shapeOptions: {
        color: this.DRAWING_DEFAULTS.color,
        opacity: this.DRAWING_DEFAULTS.opacity
      }
    });
    this.workingGeometry.enable();

    this.numVertices = 0;
    this.layerType = "polyline";
    this.hideIconToolbar();
    this.setGeometryToolbarHighlighting(evt.currentTarget);
    this.displayHelpMessage("draw-poly-geometry-start-msg");
    this.setEditingCursor();
    this.isEditing = false;
  },

  onClickCreatePolygon: function(evt) {
    evt.preventDefault();

    // Prevent repeat clicks on the same geometry drawing tool
    if (this.layerType === "polygon") return;

    this.resetWorkingGeometry();

    this.workingGeometry = new L.Draw.Polygon(this.map, {
      shapeOptions: {
        color: this.DRAWING_DEFAULTS.color,
        opacity: this.DRAWING_DEFAULTS.opacity,
        fillColor: this.DRAWING_DEFAULTS.fillColor,
        fillOpacity: this.DRAWING_DEFAULTS.fillOpacity
      }
    });
    this.workingGeometry.enable();
    
    this.numVertices = 0;
    this.layerType = "polygon";
    this.hideIconToolbar();
    this.setGeometryToolbarHighlighting(evt.currentTarget);
    this.displayHelpMessage("draw-poly-geometry-start-msg");
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
      if (this.geometryType === "marker" ||
          this.geometryType === "Point") {
        this.displayHelpMessage("edit-marker-geometry-msg");
      } else {        
        this.displayHelpMessage("modify-geometry-msg");
      }
      this.setDefaultCursor();
      this.hideIconToolbar();
      this.isEditing = false;
    } else {
      this.workingGeometry = new L.EditToolbar.Edit(this.map, {
        featureGroup: this.editingLayerGroup
      });
      this.workingGeometry.enable();
      if (this.geometryType === "marker" ||
          this.geometryType === "Point") {
        this.showIconToolbar();
        this.displayHelpMessage("edit-marker-geometry-msg");
      } else {        
        this.displayHelpMessage("edit-poly-geometry-msg");
      }
      this.setGeometryToolbarHighlighting(evt.currentTarget);
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
    this.iconUrl = this.$el.find(".geometry-toolbar-icon-field input:checked").val();
    var icon = L.icon({
      iconUrl: this.iconUrl,
      
      // TODO: these hard-coded values won't work for all icon types...
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5]
    });

    if (this.isEditing) {
      this.workingGeometry.save();
      this.resetWorkingGeometry();
      this.getLayerFromEditingLayerGroup().setIcon(icon);
      this.workingGeometry = new L.EditToolbar.Edit(this.map, {
        featureGroup: this.editingLayerGroup
      });
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
    this.colorpickerSettings.color = styles.color || this.DRAWING_DEFAULTS.color;
    this.colorpickerSettings.opacity = styles.opacity || this.DRAWING_DEFAULTS.opacity;
    this.colorpickerSettings.fillColor = styles.fillColor || this.DRAWING_DEFAULTS.fillColor;
    this.colorpickerSettings.fillOpacity = styles.fillOpacity || this.DRAWING_DEFAULTS.fillOpacity;
    this.colorpickerSettings.editMode = "fill";
    $(".sp-choose[data-edit-mode='fill']")
      .addClass("sp-selected")
      .siblings()
      .removeClass("sp-selected");
    $(".leaflet-control-colorpicker").spectrum(
      "set", 
      tinycolor(this.colorpickerSettings.fillColor).setAlpha(this.colorpickerSettings.fillOpacity).toRgbString()
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

  updateColorpicker: function() {
    $(".toolbar-colorpicker-container").spectrum("set",
      tinycolor(this.colorpickerSettings[this.DRAWING_DEFAULTS[this.colorpickerSettings.editMode].color])
        .setAlpha(this.colorpickerSettings[this.DRAWING_DEFAULTS[this.colorpickerSettings.editMode].opacity]).toRgbString());
  },

  saveWorkingGeometry: function() {
    if (this.workingGeometry) {
      this.workingGeometry.save();
    }
  },

  displayHelpMessage: function(msg) {
    this.$el.find(".helper-messages ." + msg)
      .removeClass("hidden")
      .siblings()
      .addClass("hidden");
  },

  showIconToolbar: function() {
    this.$el.find(".geometry-toolbar-icon-field")
      .removeClass("hidden");
  },

  setIconToolbarIcon: function() {
    this.$el.find(".geometry-toolbar-icon-field :input[value='" + this.iconUrl + "']")
      .prop("checked", true);
  },

  hideIconToolbar: function() {
    this.$el.find(".geometry-toolbar-icon-field").addClass("hidden");
  },

  setGeometryToolbarHighlighting: function(currentTarget) {
    var target = this.$el.find(currentTarget);

    if (target.hasClass("selected")) {
      target.removeClass("selected");
    } else {
      target
        .addClass("selected")
        .siblings()
        .removeClass("selected");
    }
  },

  swapToolbarVisibility: function() {
    this.$geometryToolbarEdit.toggleClass("hidden");
    this.$geometryToolbarCreate.toggleClass("hidden");

    if (this.geometryType === "Point" ||
        this.geometryType === "marker") {

      this.$geometryToolbarEdit.find(".colorpicker").addClass("hidden");
    } else {
      this.$geometryToolbarEdit.find(".colorpicker").removeClass("hidden");
    }

    this.resetGeometryToolbarHighlighting();
  },

  resetGeometryToolbarHighlighting: function() {
    this.$el.find(".geometry-toolbar button")
      .removeClass("selected");
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
    var returnLayer;

    // NOTE: we make an assumption here that our workingGeometry is a layer
    // group with only one layer in it, so the iteration below will return a
    // single layer. This assumption is enforced by the UI: it's only possible
    // to create a single piece of geometry before editing tools are displayed.
    this.editingLayerGroup.eachLayer(function(layer) {
      returnLayer = layer;
    });

    return returnLayer;
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
      this.changeLayerGroup(this.existingLayerView.layer, this.existingLayerView.layerGroup,
        this.editingLayerGroup);
      this.geometryType = args.geometryType;
      this.placeDetailView = args.placeDetailView;
      this.existingLayerView.isEditing = true;
      this.swapToolbarVisibility();
      this.iconUrl = args.style.iconUrl;

      // Disable deleting geometry in edit mode
      this.$el.find(".delete-geometry").addClass("hidden");
      this.$el.find(".edit-geometry").trigger("click");

      // TODO: reconcile "Point" with "marker"
      if (this.geometryType === "Point") {
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

    if (this.workingGeometry) {
      this.workingGeometry.revertLayers();
    }

    this.resetWorkingGeometry();
    this.layerType = null;
    if (this.existingLayerView) {
      this.changeLayerGroup(this.existingLayerView.layer, this.editingLayerGroup, this.existingLayerView.layerGroup);
      this.existingLayerView.isEditing = false;
      this.existingLayerView.updateLayer();
    }
    
    this.editingLayerGroup.getLayers().forEach(function(layer) {
      self.editingLayerGroup.removeLayer(layer);
    });

    this.removeLayerFromMap(this.editingLayerGroup);
    this.setDefaultCursor();

    $(".sp-picker-container").addClass("hidden");
  }
});
