import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import ColorPicker from "rc-color-picker";
import "rc-color-picker/assets/index.css";

import { mapDrawingToolbar as messages } from "../../messages";
import "./map-drawing-toolbar.scss";

const outputColorpickerState = state => {
  return {
    color: state.stroke.color,
    opacity: state.stroke.opacity,
    fillColor: state.fill.color,
    fillOpacity: state.fill.opacity,
  };
};

class MapDrawingToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headerMessage: messages.selectTool.header, // TODO
      currentPanel: props.initialPanel,
      currentGeometryType: props.initialGeometryType,
      selectedDrawingTool: null,
      selectedEditingTool: props.initialPanel + "-tool",
      selectedMarkerIndex:
        props.selectedMarkerIndex < 0 ? 0 : props.selectedMarkerIndex,
    };

    this.colorpickerState = {
      fill: {
        color: props.existingFillColor,
        opacity: props.existingFillOpacity,
      },
      stroke: {
        color: props.existingColor,
        opacity: props.existingOpacity,
      },
    };

    this.drawingObject = null;
    this.editingLayerGroup = new L.FeatureGroup().addTo(props.map);

    if (props.existingLayer) {
      this.editingLayerGroup.addLayer(props.existingLayer);
      this.drawingObject = new L.EditToolbar.Edit(props.map, {
        featureGroup: this.editingLayerGroup,
      });
      this.drawingObject.enable();
    }

    this.outputGeometry = {};

    this.onGeometryToolTypeChange = this.onGeometryToolTypeChange.bind(this);
    this.onGeometryEditToolChange = this.onGeometryEditToolChange.bind(this);

    this.props.router.on("route", this.tearDown, this);

    this.mapTools = {
      drawing: [
        {
          type: "create-marker-tool",
          label: messages.createMarkerTool.label,
          imgSrc: "",
        },
        {
          type: "create-polyline-tool",
          label: messages.createPolylineTool.label,
        },
        {
          type: "create-polygon-tool",
          label: messages.createPolygonTool.label,
        },
      ],
      editing: {
        marker: [
          {
            type: "edit-marker-tool",
            label: messages.editMarkerTool.label,
          },
          {
            type: "delete-marker-tool",
            label: messages.deleteMarkerTool.label,
          },
        ],
        polyline: [
          {
            type: "edit-polyline-tool",
            label: messages.editPolylineTool.label,
          },
          {
            type: "delete-polyline-tool",
            label: messages.deletePolylineTool.label,
          },
          {
            type: "colorpicker-stroke-tool",
            mode: "stroke",
            label: messages.colorpickerStrokeTool.label,
          },
        ],
        polygon: [
          {
            type: "edit-polygon-tool",
            label: messages.editPolygonTool.label,
          },
          {
            type: "delete-polygon-tool",
            label: messages.deletePolygonTool.label,
          },
          {
            type: "colorpicker-fill-tool",
            mode: "fill",
            label: messages.colorpickerFillTool.label,
          },
          {
            type: "colorpicker-stroke-tool",
            mode: "stroke",
            label: messages.colorpickerStrokeTool.label,
          },
        ],
      },
      selectIcon: {
        header: messages.selectMarkerType.header,
      },
    };

    this.numVertices = 0;

    this.props.map.on("draw:drawvertex", this.handleDrawVertexEvent.bind(this));
    this.props.map.on("draw:created", this.handleDrawCreatedEvent.bind(this));
    this.props.map.on("draw:editvertex", this.handleEditEvent.bind(this));
    this.props.map.on("draw:editmove", this.handleEditEvent.bind(this));
    this.props.map.on("draw:edited", this.handleEditEvent.bind(this));
  }

  handleDrawVertexEvent() {
    this.numVertices++;

    if (this.state.currentGeometryType === "polygon" && this.numVertices <= 2) {
      this.setState({
        headerMessage: messages.createPolygon.header.continue,
      });
    } else if (
      this.state.currentGeometryType === "polygon" &&
      this.numVertices > 2
    ) {
      this.setState({
        headerMessage: messages.createPolygon.header.continueOrFinish,
      });
    } else if (
      this.state.currentGeometryType === "polyline" &&
      this.numVertices === 1
    ) {
      this.setState({
        headerMessage: messages.createPolyline.header.continue,
      });
    } else if (
      this.state.currentGeometryType === "polyline" &&
      this.numVertices > 1
    ) {
      this.setState({
        headerMessage: messages.createPolyline.header.continueOrFinish,
      });
    }
  }

  handleEditEvent() {
    this.generateOutputGeometry(this.getLayerFromEditingLayerGroup());
  }

  handleDrawCreatedEvent(evt) {
    this.generateOutputGeometry(evt.layer);
    this.editingLayerGroup.addLayer(evt.layer);

    let headerMessage, selectedEditingTool;
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
      selectedEditingTool: selectedEditingTool,
    });
    this.makeGeometryEditable();
  }

  componentWillUnmount() {
    this.tearDown();
  }

  buildCoords(latLngs) {
    return latLngs.map(pair => {
      return [pair.lng, pair.lat];
    });
  }

  generateOutputGeometry(layer) {
    let style;

    if (layer instanceof L.Polygon) {
      let latLngs = layer.getLatLngs(),
        coords = this.buildCoords(latLngs);

      // NOTE: We push the initial polygon vertext onto the end of the vertex
      // array here so we ensure the final vertex exactly matches the first. The
      // database will reject polygonal geometry otherwise.
      coords.push([latLngs[0].lng, latLngs[0].lat]);

      this.outputGeometry = {
        type: "Polygon",
        coordinates: [coords],
      };
      style = outputColorpickerState(this.colorpickerState);
    } else if (layer instanceof L.Polyline) {
      this.outputGeometry = {
        type: "LineString",
        coordinates: this.buildCoords(layer.getLatLngs()),
      };
      style = outputColorpickerState(this.colorpickerState);
    } else if (layer instanceof L.Marker) {
      this.outputGeometry = {
        type: "Point",
        coordinates: [layer._latlng.lng, layer._latlng.lat],
      };
      style = { iconUrl: layer.options.icon.options.iconUrl };
    }

    this.props.onChange(this.props.name, this.outputGeometry);
    this.props.onGeometryStyleChange(style);
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
            iconAnchor: [12.5, 12.5],
          }),
        }).addTo(this.editingLayerGroup);
        this.generateOutputGeometry(this.getLayerFromEditingLayerGroup());
        this.setState({
          headerMessage: messages.createMarker.header,
          currentPanel: "edit-marker",
          currentGeometryType: "marker",
          selectedEditingTool: "edit-marker-tool",
        });
        this.makeGeometryEditable();
        break;
      case "create-polyline-tool":
        this.resetDrawingObject();
        this.drawingObject = new L.Draw.Polyline(this.props.map, {
          shapeOptions: {
            color: this.colorpickerState.stroke.color,
            opacity: this.colorpickerState.stroke.opacity,
          },
        });
        this.drawingObject.enable();
        this.numVertices = 0;
        this.setState({
          headerMessage: messages.createPolyline.header.initial,
          currentGeometryType: "polyline",
          selectedDrawingTool: evt.target.id,
        });
        break;
      case "create-polygon-tool":
        this.resetDrawingObject();
        this.drawingObject = new L.Draw.Polygon(this.props.map, {
          shapeOptions: {
            color: this.colorpickerState.stroke.color,
            opacity: this.colorpickerState.stroke.opacity,
            fillColor: this.colorpickerState.fill.color,
            fillOpacity: this.colorpickerState.fill.opacity,
          },
        });
        this.drawingObject.enable();
        this.numVertices = 0;
        this.setState({
          headerMessage: messages.createPolygon.header.initial,
          currentGeometryType: "polygon",
          selectedDrawingTool: evt.target.id,
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
        selectedEditingTool: null,
      });
      this.props.onGeometryStyleChange(null);
      this.props.onChange(this.props.name, null);
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
          selectedEditingTool: evt.target.id,
        });
      } else if (evt.target.id === "edit-polyline-tool") {
        this.setState({
          headerMessage: messages.editPolyline.header,
          currentPanel: "edit-polyline",
          selectedDrawingTool: null,
          selectedEditingTool: evt.target.id,
        });
      } else if (evt.target.id === "edit-polygon-tool") {
        this.setState({
          headerMessage: messages.editPolygon.header,
          currentPanel: "edit-polygon",
          selectedDrawingTool: null,
          selectedEditingTool: evt.target.id,
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

    this.props.onGeometryStyleChange({
      iconUrl: iconUrl,
    });
  }

  onColorpickerChange(colorInfo, colorpickerTool) {
    if (this.editingLayerGroup.getLayers().length > 0) {
      if (colorpickerTool === "colorpicker-fill-tool") {
        this.editingLayerGroup.getLayers()[0].setStyle({
          fillColor: colorInfo.color,
          fillOpacity: colorInfo.alpha / 100,
        });
        this.colorpickerState.fill.color = colorInfo.color;
        this.colorpickerState.fill.opacity = colorInfo.alpha / 100;
      } else if (colorpickerTool === "colorpicker-stroke-tool") {
        this.editingLayerGroup.getLayers()[0].setStyle({
          color: colorInfo.color,
          opacity: colorInfo.alpha / 100,
        });
        this.colorpickerState.stroke.color = colorInfo.color;
        this.colorpickerState.stroke.opacity = colorInfo.alpha / 100;
      }

      this.props.onGeometryStyleChange(
        outputColorpickerState(this.colorpickerState)
      );
    }
  }

  onColorpickerOpen(colorpickerTool) {
    this.setState({ selectedEditingTool: colorpickerTool });
  }

  onColorpickerClose() {
    this.setState({ selectedEditingTool: null });
  }

  getLayerFromEditingLayerGroup() {
    let returnLayers = [];

    // NOTE: we make an assumption here that our workingGeometry is a layer
    // group with only one layer in it, so the iteration below will return a
    // single layer. In case there are more layers in the editingLayerGroup for
    // some reason, we only return the first layer found.
    this.editingLayerGroup.eachLayer(layer => {
      returnLayers.push(layer);
    });

    return returnLayers[0];
  }

  clearEditingLayerGroup() {
    this.editingLayerGroup.eachLayer(layer => {
      this.editingLayerGroup.removeLayer(layer);
    });
  }

  tearDown() {
    this.props.map.off("draw:created", this.handleDrawCreatedEvent);
    this.props.map.off("draw:drawvertex", this.handleDrawVertexEvent);
    this.props.map.off("draw:editvertex", this.handleEditEvent);
    this.props.map.off("draw:editmove", this.handleEditEvent);
    this.props.map.off("draw:edited", this.handleEditEvent);
    this.props.router.off("route", this.tearDown, this);
    this.setState({
      headerMessage: messages.selectTool.header,
      currentPanel: "select-geometry-type",
      currentGeometryType: null,
      selectedDrawingTool: null,
      selectedEditingTool: null,
      selectedMarkerIndex: 0,
      isStrokeColorpickerToggled: false,
      isFillColorpickerToggled: false,
    });
    this.resetDrawingObject();
    this.clearEditingLayerGroup();
  }

  getVisibility(uiElement) {
    const { currentPanel } = this.state;
    if (uiElement === "select-geometry-type") {
      return currentPanel === "select-geometry-type";
    } else if (uiElement === "select-marker-type") {
      return currentPanel === "edit-marker";
    } else if (uiElement === "edit-geometry") {
      return currentPanel !== "select-geometry-type";
    } else {
      return null;
    }
  }

  render() {
    const cn = {
      drawingToolsContainer: classNames(
        "map-drawing-toolbar__drawing-tools-container",
        {
          "map-drawing-toolbar__drawing-tools-container--visible": this.getVisibility(
            "select-geometry-type"
          ),
        }
      ),
      editingToolsContainer: classNames(
        "map-drawing-toolbar__editing-tools-container",
        {
          "map-drawing-toolbar__editing-tools-container--visible": this.getVisibility(
            "edit-geometry"
          ),
        }
      ),
      markerSelectionHeader: classNames(
        "map-drawing-toolbar__marker-selection-header",
        {
          "map-drawing-toolbar__marker-selection-header--visible": this.getVisibility(
            "select-marker-type"
          ),
        }
      ),
      markerSelectionContainer: classNames(
        "map-drawing-toolbar__marker-selection-container",
        {
          "map-drawing-toolbar__marker-selection-container--visible": this.getVisibility(
            "select-marker-type"
          ),
        }
      ),
    };
    const editingTools =
      this.state.currentGeometryType &&
      this.mapTools.editing[this.state.currentGeometryType].map(tool => {
        let toolbarItemClassName;
        if (tool.type.startsWith("colorpicker-")) {
          toolbarItemClassName = classNames(
            "map-drawing-toolbar__toolbar-item",
            "map-drawing-toolbar__" + tool.type,
            {
              "map-drawing-toolbar__toolbar-item--selected":
                this.state.selectedEditingTool === tool.type,
            }
          );

          return (
            <label
              className={toolbarItemClassName}
              key={tool.type}
              onMouseOver={() =>
                this.setState({ hoveredToolbarItem: tool.type })
              }
              onMouseOut={() => this.setState({ hoveredToolbarItem: null })}
            >
              <ColorPicker
                color={this.colorpickerState[tool.mode].color}
                alpha={this.colorpickerState[tool.mode].opacity * 100}
                mode="RGB"
                enableAlpha={true}
                onOpen={() => this.onColorpickerOpen(tool.type)}
                onClose={() => this.onColorpickerClose(tool.type)}
                onChange={colorInfo =>
                  this.onColorpickerChange(colorInfo, tool.type)
                }
                placement="topRight"
              />
              {tool.label}
            </label>
          );
        } else {
          toolbarItemClassName = classNames(
            "map-drawing-toolbar__toolbar-item",
            "map-drawing-toolbar__" + tool.type,
            {
              "map-drawing-toolbar__toolbar-item--selected":
                this.state.selectedEditingTool === tool.type,
            }
          );

          return (
            <label
              className={toolbarItemClassName}
              key={tool.type}
              htmlFor={tool.type}
              onMouseOver={() =>
                this.setState({ hoveredToolbarItem: tool.type })
              }
              onMouseOut={() => this.setState({ hoveredToolbarItem: null })}
            >
              <input
                className="map-drawing-toolbar__toolbar-item-input"
                id={tool.type}
                type="radio"
                checked={this.state.selectedEditingTool === tool.type}
                name="map-drawing-toolbar-create-geometry-buttons"
                value={tool.type}
                onChange={this.onGeometryEditToolChange}
              />
              {tool.label}
            </label>
          );
        }
      });

    return (
      <div className="map-drawing-toolbar">
        <p className="map-drawing-toolbar__drawing-tools-header">
          {this.state.headerMessage}
        </p>
        <div className={cn.drawingToolsContainer}>
          {this.mapTools.drawing.map(tool => {
            let toolbarItemClassName = classNames(
              "map-drawing-toolbar__toolbar-item",
              "map-drawing-toolbar__" + tool.type,
              {
                "map-drawing-toolbar__toolbar-item--selected":
                  this.state.selectedDrawingTool === tool.type,
              }
            );

            return (
              <label
                className={toolbarItemClassName}
                key={tool.type}
                htmlFor={tool.type}
                onMouseOver={() =>
                  this.setState({ hoveredToolbarItem: tool.type })
                }
                onMouseOut={() => this.setState({ hoveredToolbarItem: null })}
              >
                <input
                  className="map-drawing-toolbar__toolbar-item-input"
                  id={tool.type}
                  type="radio"
                  checked={this.state.selectedDrawingTool === tool.type}
                  name="map-drawing-toolbar-create-geometry-buttons"
                  value={tool.type}
                  onChange={this.onGeometryToolTypeChange}
                />
                {tool.label}
              </label>
            );
          })}
        </div>
        <div className={cn.editingToolsContainer}>{editingTools}</div>
        <p className={cn.markerSelectionHeader}>
          {this.mapTools.selectIcon.header}
        </p>
        <div className={cn.markerSelectionContainer}>
          {this.props.markers.map((marker, i) => {
            let markerItemClassName = classNames(
              "map-drawing-toolbar__marker-item",
              {
                "map-drawing-toolbar__marker-item--selected":
                  this.state.selectedMarkerIndex === i,
              }
            );

            return (
              <label
                className={markerItemClassName}
                key={marker}
                htmlFor={"map-drawing-toolbar__marker-item-input-" + i}
                onMouseOver={() => this.setState({ hoveredMarkedItemIndex: i })}
                onMouseOut={() =>
                  this.setState({ hoveredMarkedItemIndex: null })
                }
              >
                <input
                  className="map-drawing-toolbar__marker-item-input"
                  id={"map-drawing-toolbar__marker-item-input-" + i}
                  type="radio"
                  checked={this.state.selectedMarkerIndex === i}
                  name="map-drawing-toolbar-select-marker-buttons"
                  value={marker}
                  onChange={() => this.onMarkerSelectionChange(i)}
                />
                <img
                  className="map-drawing-toolbar__marker-item-image"
                  src={marker}
                />
              </label>
            );
          })}
        </div>
      </div>
    );
  }
}

MapDrawingToolbar.propTypes = {
  existingColor: PropTypes.string.isRequired,
  existingFillColor: PropTypes.string.isRequired,
  existingFillOpacity: PropTypes.number.isRequired,
  existingOpacity: PropTypes.number.isRequired,
  existingLayer: PropTypes.object.isRequired,
  initialPanel: PropTypes.string.isRequired,
  initialGeometryType: PropTypes.string.isRequired,
  mapDrawingToolbarState: PropTypes.object.isRequired,
  map: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onGeometryStyleChange: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  selectedMarkerIndex: PropTypes.number.isRequired,
  markers: PropTypes.array.isRequired,
};

MapDrawingToolbar.defaultProps = {
  existingLayer: null,
  initialPanel: "select-geometry-type",
  currentGeometryType: null,
  selectedEditingTool: null,
  selectedMarkerIndex: 0,
  existingFillColor: "#f1f075",
  existingFillOpacity: 0.3,
  existingColor: "#f86767",
  existingOpacity: 0.7,
};

export default MapDrawingToolbar;
