import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "bem-classnames";
//import ColorPicker from "rc-color-picker";

import { RadioField } from "../form-fields/radio-field";
import { LabelWithInlineImage } from "../ui-elements/label-with-inline-image";
import { mapDrawingToolbar as messages } from "../messages";

const baseClass = "map-drawing-toolbar";

const drawingDefaults = {
  color: "#f86767", // stroke color
  opacity: 0.7*100, // stroke opacity
  fillColor: "#f1f075",
  fillOpacity: 0.3*100
};

class MapDrawingToolbar extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      headerMessage: messages.selectTool.header,
      currentPanel: "select-geometry-type",
      currentGeometryType: null,
      selectedDrawingTool: null,
      selectedEditingTool: null,
      selectedMarkerIndex: 0,
      strokeColorpickerToggled: false,
      fillColorpickerToggled: false
    };

    this.colorpickerState = {
      strokeColor: drawingDefaults.color,
      strokeOpacity: drawingDefaults.opacity,
      fillColor: drawingDefaults.fillColor,
      fillOpacity: drawingDefaults.fillOpacity
    };

    this.drawingObject = null;
    this.editingLayerGroup = new L.FeatureGroup().addTo(this.props.map);
    this.outputGeometry = {};

    this.mapTools = {
      drawing: [
        {
          type: "create-marker-tool",
          label: messages.createMarkerTool.label,
          imgSrc: ""
        },
        {
          type: "create-polyline-tool",
          label: messages.createPolylineTool.label
        },
        {
          type: "create-polygon-tool",
          label: messages.createPolygonTool.label
        }
      ],
      editing: {
        marker: [
          {
            type: "edit-marker-tool",
            label: messages.editMarkerTool.label
          },
          {
            type: "delete-marker-tool",
            label: messages.deleteMarkerTool.label
          }
        ],
        polyline: [
          {
            type: "edit-polyline-tool",
            label: messages.editPolylineTool.label
          },
          {
            type: "delete-polyline-tool",
            label: messages.deletePolylineTool.label
          },
          {
            type: "colorpicker-stroke-tool",
            mode: "stroke",
            label: messages.colorpickerStrokeTool.label
          }
        ],
        polygon: [
          {
            type: "edit-polygon-tool",
            label: messages.editPolygonTool.label
          },
          {
            type: "delete-polygon-tool",
            label: messages.deletePolygonTool.label
          },
          {
            type: "colorpicker-fill-tool",
            mode: "fill",
            label: messages.colorpickerFillTool.label
          },
          {
            type: "colorpicker-stroke-tool",
            mode: "stroke",
            label: messages.colorpickerStrokeTool.label
          }
        ]
      },
      selectIcon: {
        header: messages.selectMarkerType.header
      }
    };

    this.classes = {
      drawingToolsHeader: {
        name: baseClass + "__drawing-tools-header"
      },
      drawingToolsContainer: {
        name: baseClass + "__drawing-tools-container",
        modifiers: ["visibility"]
      },
      editingToolsContainer: {
        name: baseClass + "__editing-tools-container",
        modifiers: ["visibility"]
      },
      markerSelectionHeader: {
        name: baseClass + "__marker-selection-header",
        modifiers: ["visibility"]
      },
      markerSelectionContainer: {
        name: baseClass + "__marker-selection-container",
        modifiers: ["visibility"]
      },
      markerSelectionMarker: {
        name: baseClass + "__marker-selection-marker",
        modifiers: ["visibility"]
      },
      strokeColorpickerTool: {
        name: baseClass + "__stroke-colorpicker-tool"
      },
      fillColorpickerTool: {
        name: baseClass + "__fill-colorpicker-tool"
      },
      strokeColorpickerContainer: {
        name: baseClass + "__stroke-colorpicker-container",
        modifiers: ["toggled"]
      },
      fillColorpickerContainer: {
        name: baseClass + "__fill-colorpicker-container",
        modifiers: ["toggled"]
      },
      colorpickerLabel: {
        name: baseClass + "__colorpicker-label"
      }
    };

    this.numVertices = 0;

    this.props.map.on("draw:drawvertex", (evt) => {
      this.numVertices++;

      if (this.state.currentGeometryType === "polygon" && this.numVertices <= 2) {
        this.setState({ headerMessage: messages.createPolygon.header.continue });
      } else if (this.state.currentGeometryType === "polygon" && this.numVertices > 2) {
        this.setState({ headerMessage: messages.createPolygon.header.continueOrFinish });
      } else if (this.state.currentGeometryType === "polyline" && this.numVertices === 1) {
        this.setState({ headerMessage: messages.createPolyline.header.continue });
      } else if (this.state.currentGeometryType === "polyline" && this.numVertices > 1) {
        this.setState({ headerMessage: messages.createPolyline.header.continueOrFinish });
      }
    });

    this.props.map.on("draw:created", (evt) => {
      this.generateOutputGeometry(evt.layer);
      this.editingLayerGroup.addLayer(evt.layer);

      let headerMessage,
          selectedEditingTool;
      if (this.state.currentGeometryType === "marker") {
        headerMessage = messages.editMarker.header;
        selectedEditingTool = "edit-marker-tool";
      } else if (this.state.currentGeometryType === "polyline") {
        headerMessage = messages.editPolyline.header;
        selectedEditingTool = "edit-polyline-tool";
      } else if (this.state.currentGeometryType === "polygon") {
        headerMessage = messages.editPolygon.header;
        selectedEditingTool = "edit-polygon-tool";
      }

      this.setState({ 
        currentPanel: "edit-" + this.state.currentGeometryType,
        headerMessage: headerMessage,
        selectedEditingTool: selectedEditingTool
      });
      this.makeGeometryEditable();
    });

    this.props.map.on("draw:editvertex", (evt) => {
      this.generateOutputGeometry(this.getLayerFromEditingLayerGroup());
    });

    this.props.map.on("draw:editmove", (evt) => {
      this.generateOutputGeometry(this.getLayerFromEditingLayerGroup());
    });

    this.props.map.on("draw:edited", (evt) => {
      this.generateOutputGeometry(this.getLayerFromEditingLayerGroup());
    });
  }

  componentWillReceiveProps() {
    if (!this.props.formIsOpen) {
      this.tearDown();
    }
  }

  buildCoords(latLngs) {
    return latLngs.map(function(pair) {
      return [pair.lng, pair.lat];
    });
  }

  generateOutputGeometry(layer) {
    if (layer instanceof L.Polygon) {
      let latLngs = layer.getLatLngs(),
          coords = this.buildCoords(latLngs);

      coords.push([latLngs[0].lng, latLngs[0].lat]);

      this.outputGeometry = {
        type: "Polygon",
        // We push the initial polygon vertext onto the end of the vertex array
        // here so we ensure the final vertex exactly matches the first. The
        // database will reject polygonal geometry otherwise.
        coordinates: coords,
      };
    } else if (layer instanceof L.Polyline) {
      this.outputGeometry = {
        type: "LineString",
        coordinates: this.buildCoords(layer.getLatLngs())
      };
    } else if (layer instanceof L.Marker) {
      this.outputGeometry = {
        type: "Point",
        coordinates: [layer._latlng.lng, layer._latlng.lat],
      };
    }

    this.props.onGeometry(this.outputGeometry);
  }

  onGeometryToolTypeChange(evt) {
    switch (evt.target.id) {
      case "create-marker-tool":

        // NOTE: Creation of markers is handled differently from polygons and 
        // polylines: we place the marker directly on the map and jump 
        // immediately into edit mode.
        L.marker(this.props.map.getCenter(), {
          icon: new L.icon({
            iconUrl: this.props.markers[this.state.selectedMarkerIndex],

            // NOTE: These icon parameters are suitable for round icons
            // TODO: Make this configurable
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5]
          }),
        }).addTo(this.editingLayerGroup);
        this.generateOutputGeometry(this.getLayerFromEditingLayerGroup());
        this.setState({
          headerMessage: messages.createMarker.header,
          currentPanel: "edit-marker",
          currentGeometryType: "marker",
          selectedEditingTool: "edit-marker-tool"
        });
        this.makeGeometryEditable();
        break;
      case "create-polyline-tool":
        this.resetDrawingObject();
        this.drawingObject = new L.Draw.Polyline(this.props.map, {
          shapeOptions: {
            color: this.colorpickerState.strokeColor,
            opacity: this.colorpickerState.strokeOpacity/100
          },
        });
        this.drawingObject.enable();
        this.numVertices = 0;
        this.setState({
          headerMessage: messages.createPolyline.header.initial,
          currentGeometryType: "polyline",
          selectedDrawingTool: evt.target.id
        });
        break;
      case "create-polygon-tool":
        this.resetDrawingObject();
        this.drawingObject = new L.Draw.Polygon(this.props.map, {
          shapeOptions: {
            color: this.colorpickerState.strokeColor,
            opacity: this.colorpickerState.strokeOpacity/100,
            fillColor: this.colorpickerState.fillColor,
            fillOpacity: this.colorpickerState.fillOpacity/100
          },
        });
        this.drawingObject.enable();
        this.numVertices = 0;
        this.setState({
          headerMessage: messages.createPolygon.header.initial,
          currentGeometryType: "polygon",
          selectedDrawingTool: evt.target.id
        });
        break;
    }
  }

  resetDrawingObject() {
    if (this.drawingObject) {
      this.drawingObject.disable();
      this.drawingObject = null;
    }
  }

  makeGeometryEditable() {
    this.resetDrawingObject();
    this.drawingObject = new L.EditToolbar.Edit(this.props.map, {
      featureGroup: this.editingLayerGroup,
    });
    this.drawingObject.enable();
  }

  onGeometryEditToolChange(evt) {
    if (evt.target.id.startsWith("delete-")) {
      this.resetDrawingObject();
      this.clearEditingLayerGroup();
      this.setState({
        headerMessage: messages.selectTool.header,
        currentPanel: "select-geometry-type",
        currentGeometryType: null,
        selectedDrawingTool: null,
        selectedEditingTool: null
      });
    } else if (evt.target.id.startsWith("edit-")) {
      this.drawingObject = new L.EditToolbar.Edit(this.props.map, {
        featureGroup: this.editingLayerGroup,
      });
      this.drawingObject.enable();
      if (evt.target.id === "edit-marker-tool") {
        this.setState({
          headerMessage: messages.editMarker.header,
          currentPanel: "edit-marker",
          selectedDrawingTool: null,
          selectedEditingTool: evt.target.id
        });
      } else if (evt.target.id === "edit-polyline-tool") {
        this.setState({
          headerMessage: messages.editPolyline.header,
          currentPanel: "edit-polyline",
          selectedDrawingTool: null,
          selectedEditingTool: evt.target.id
        });
      } else if (evt.target.id === "edit-polygon-tool") {
        this.setState({
          headerMessage: messages.editPolygon.header,
          currentPanel: "edit-polygon",
          selectedDrawingTool: null,
          selectedEditingTool: evt.target.id
        });
      }
    }
  }

  onMarkerSelectionChange(selectedMarkerIndex) {
    this.setState({ selectedMarkerIndex: selectedMarkerIndex });
    let iconUrl = this.props.markers[selectedMarkerIndex],
        icon = L.icon({
          iconUrl: iconUrl,

          // NOTE: These icon parameters are suitable for round icons
          // TODO: Make this configurable
          iconSize: [25, 25],
          iconAnchor: [12.5, 12.5],
        });

    this.getLayerFromEditingLayerGroup().setIcon(icon);
  }

  onColorpickerChange(colorInfo, colorpickerId) {
    if (this.editingLayerGroup.getLayers().length > 0) {
      if (colorpickerId === "colorpicker-fill-tool") {
        this.editingLayerGroup.getLayers()[0].setStyle({
          fillColor: colorInfo.color,
          fillOpacity: colorInfo.alpha/100,
        });
        this.colorpickerState.fillColor = colorInfo.color;
        this.colorpickerState.fillOpacity = colorInfo.alpha;
      } else if (colorpickerId === "colorpicker-stroke-tool") {
        this.editingLayerGroup.getLayers()[0].setStyle({
          color: colorInfo.color,
          opacity: colorInfo.alpha/100,
        });
        this.colorpickerState.strokeColor = colorInfo.color;
        this.colorpickerState.strikeOpacity = colorInfo.alpha;
      }
    }
  }

  onColorpickerToggle(colorpickerTool) {
    this.resetDrawingObject();
    let strokeColorpickerToggled,
        fillColorpickerToggled;

    if (colorpickerTool === "colorpicker-stroke-tool") {
      strokeColorpickerToggled = !this.state.strokeColorpickerToggled;
      fillColorpickerToggled = false;
    } else if (colorpickerTool === "colorpicker-fill-tool") {
      fillColorpickerToggled = !this.state.fillColorpickerToggled;
      strokeColorpickerToggled = false;
    }

    this.setState({ 
      strokeColorpickerToggled: strokeColorpickerToggled,
      fillColorpickerToggled: fillColorpickerToggled,
      selectedEditingTool: colorpickerTool
    });
  }

  getVisibility(uiElement) {
    if (uiElement === "select-geometry-type") {
      switch (this.state.currentPanel) {
        case "select-geometry-type":
          return "visible";
          break;
        case "edit-marker":
          return "hidden";
          break;
        case "edit-polyline":
          return "hidden";
          break;
        case "edit-polygon":
          return "hidden";
          break;
      }
    } else if (uiElement === "select-marker-type") {
      switch (this.state.currentPanel) {
        case "select-geometry-type":
          return "hidden";
          break;
        case "edit-marker":
          return "visible";
          break;
        case "edit-polyline":
          return "hidden";
          break;
        case "edit-polygon":
          return "hidden";
          break;
      }
    } else if (uiElement === "edit-geometry") {
      switch (this.state.currentPanel) {
        case "select-geometry-type":
          return "hidden";
          break;
        case "edit-marker":
          return "visible";
          break;
        case "edit-polyline":
          return "visible";
          break;
        case "edit-polygon":
          return "visible";
          break;
      }
    } else if (uiElement === "select-marker-type") {
      switch (this.state.currentPanel) {
        case "select-geometry-type":
          return "hidden";
          break;
        case "edit-marker":
          return "visible";
          break;
        case "edit-polyline":
          return "hidden";
          break;
        case "edit-polygon":
          return "hidden";
          break;
      }
    }
  }

  getLayerFromEditingLayerGroup() {
    let returnLayers = [];

    // NOTE: we make an assumption here that our workingGeometry is a layer
    // group with only one layer in it, so the iteration below will return a
    // single layer. In case there are more layers in the editingLayerGroup for
    // some reason, we only return the first layer found.
    this.editingLayerGroup.eachLayer((layer) => {
      returnLayers.push(layer);
    });

    return returnLayers[0];
  }

  clearEditingLayerGroup() {
    this.editingLayerGroup.eachLayer((layer) => {
      this.editingLayerGroup.removeLayer(layer);
    });
  }

  tearDown() {
    this.setState({
      headerMessage: messages.selectTool.header,
      currentPanel: "select-geometry-type",
      currentGeometryType: null,
      selectedDrawingTool: null,
      selectedEditingTool: null,
      selectedMarkerIndex: 0,
      strokeColorpickerToggled: false,
      fillColorpickerToggled: false
    });

    this.resetDrawingObject();
    this.clearEditingLayerGroup();
  }

  render() {
    let editingTools = this.state.currentGeometryType && this.mapTools.editing[this.state.currentGeometryType].map((tool) => {
      if (tool.type.startsWith("colorpicker-")) {
        let colorpickerToolClass;
        if (tool.type === "colorpicker-stroke-tool") {
          colorpickerToolClass = cx((this.classes.strokeColorpickerContainer), { toggled: (this.state.strokeColorpickerToggled) ? "toggled" : "untoggled" });
        } else if (tool.type === "colorpicker-fill-tool") {
          colorpickerToolClass = cx((this.classes.fillColorpickerContainer), { toggled: (this.state.fillColorpickerToggled) ? "toggled" : "untoggled" });
        }

        return(
          <div 
            className={colorpickerToolClass}
            key={tool.type}>
            <ColorPicker 
              color={this.colorpickerState[tool.mode + "Color"]}
              alpha={this.colorpickerState[tool.mode + "Opacity"]}
              mode="RGB"
              enableAlpha={true}
              onOpen={() => this.onColorpickerToggle(tool.type)}
              onClose={() => this.onColorpickerToggle(tool.type)}
              onChange={(colorInfo) => this.onColorpickerChange(colorInfo, tool.type)}
              placement="topRight"
              className={cx(this.classes[tool.mode + "ColorpickerTool"])} />
            <span className={cx(this.classes.colorpickerLabel)}>{tool.label}</span>
          </div>
        ); 
      } else {
        return(
          <div 
            className={baseClass + "__" + tool.type}
            key={tool.type}>
            <input 
              id={tool.type}
              type="radio"
              checked={this.state.selectedEditingTool === tool.type}
              name="map-drawing-toolbar-edit-geometry-buttons"
              value={tool.type}
              onChange={this.onGeometryEditToolChange.bind(this)} />
            <LabelWithInlineImage 
              inputId={tool.type}
              labelText={tool.label} />
          </div>
        );     
      }
    });

    return (
      <div className={baseClass}>
        <p className={cx(this.classes.drawingToolsHeader)}>{this.state.headerMessage}</p>
        <div className={cx(this.classes.drawingToolsContainer, { visibility: this.getVisibility("select-geometry-type") })}>
          {this.mapTools.drawing.map((tool) => 
            <div 
              className={baseClass + "__" + tool.type}
              key={tool.type}>
              <input 
                id={tool.type}
                type="radio"
                checked={this.state.selectedDrawingTool === tool.type}
                name="map-drawing-toolbar-create-geometry-buttons"
                value={tool.type}
                onChange={this.onGeometryToolTypeChange.bind(this)} />
              <LabelWithInlineImage 
                inputId={tool.type}
                labelText={tool.label} />
            </div>
          )}
        </div>
        <div className={cx(this.classes.editingToolsContainer, { visibility: this.getVisibility("edit-geometry") })}>
          {editingTools}
        </div>
        <p className={cx(this.classes.markerSelectionHeader, { visibility: this.getVisibility("select-marker-type") })}>{this.mapTools.selectIcon.header}</p>
        <div className={cx(this.classes.markerSelectionContainer, { visibility: this.getVisibility("select-marker-type") })}>
          {this.props.markers.map((marker, i) => 
            <div 
              className={baseClass + "__" + "marker-item"}
              key={marker}>
              <input 
                id={baseClass + "__" + "marker-item-input-" + i}
                type="radio"
                checked={this.state.selectedMarkerIndex === i}
                name="map-drawing-toolbar-select-marker-buttons"
                value={marker}
                onChange={() => this.onMarkerSelectionChange(i)} />
              <LabelWithInlineImage
                inputId={baseClass + "__" + "marker-item-input-" + i}
                imageSrc={marker} />
            </div>
          )}
        </div>
      </div>
    );
  }
};

MapDrawingToolbar.propTypes = {
  map: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  markers: PropTypes.array.isRequired,
  onGeometry: PropTypes.func.isRequired
};

export { MapDrawingToolbar };
