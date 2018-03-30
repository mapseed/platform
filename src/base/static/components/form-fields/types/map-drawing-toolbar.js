import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import ColorPicker from "rc-color-picker";
import "rc-color-picker/assets/index.css";

import messages from "../messages";
import constants from "../../../constants";
import "./map-drawing-toolbar.scss";

const outputColorpickerState = state => {
  return {
    color: state.stroke.color,
    opacity: state.stroke.opacity,
    fillColor: state.fill.color,
    fillOpacity: state.fill.opacity,
  };
};

// TODO: This component needs to be cleaned up and broken up.

const GEOMETRIES = {
  Point: {
    leafletTerm: "marker",
    editorPanel: "edit-marker",
    headerMessage: "editMarker",
    editorTool: "edit-marker-tool",
  },
  LineString: {
    leafletTerm: "polyline",
    editorPanel: "edit-polyline",
    headerMessage: "editPolyline",
    editorTool: "edit-polyline-tool",
  },
  Polygon: {
    leafletTerm: "polygon",
    editorPanel: "edit-polygon",
    headerMessage: "editPolygon",
    editorTool: "edit-polygon-tool",
  },
};

class MapDrawingToolbar extends Component {
  constructor(props) {
    super(props);

    const existingGeometryType =
      props.existingGeometry &&
      props.existingGeometry.get(constants.GEOMETRY_TYPE_PROPERTY_NAME);
    this.state = {
      headerMessage: existingGeometryType
        ? messages.t(
            `mapDrawingToolbar:${
              GEOMETRIES[existingGeometryType].headerMessage
            }Header`,
          )
        : messages("fields:mapDrawingToolbar:selectToolHeader"),
      currentPanel: existingGeometryType
        ? GEOMETRIES[existingGeometryType].editorPanel
        : "select-geometry-type",
      currentGeometryType: existingGeometryType
        ? GEOMETRIES[existingGeometryType].leafletTerm
        : null,
      selectedDrawingTool: null,
      selectedEditingTool: existingGeometryType
        ? GEOMETRIES[existingGeometryType].editorTool
        : null,
      selectedMarkerIndex:
        props.existingGeometryStyle &&
        props.existingGeometryStyle.get(constants.ICON_URL_PROPERTY_NAME)
          ? props.fieldConfig.content.findIndex(
              marker =>
                marker.url ===
                props.existingGeometryStyle.get(
                  constants.ICON_URL_PROPERTY_NAME,
                ),
            )
          : 0,
    };

    this.colorpickerState = {
      fill: {
        color:
          (props.existingGeometryStyle &&
            props.existingGeometryStyle.get(
              constants.FILL_COLOR_PROPERTY_NAME,
            )) ||
          "#f1f075",
        opacity:
          (props.existingGeometryStyle &&
            props.existingGeometryStyle.get(
              constants.FILL_OPACITY_PROPERTY_NAME,
            )) ||
          0.3,
      },
      stroke: {
        color:
          (props.existingGeometryStyle &&
            props.existingGeometryStyle.get(constants.COLOR_PROPERTY_NAME)) ||
          "#f86767",
        opacity:
          (props.existingGeometryStyle &&
            props.existingGeometryStyle.get(constants.OPACITY_PROPERTY_NAME)) ||
          0.7,
      },
    };

    // Set the initial geometry style.
    if (props.existingGeometryStyle) {
      this.props.onGeometryStyleChange(props.existingGeometryStyle);
    }

    this.drawingObject = null;
    this.editingLayerGroup = new L.FeatureGroup().addTo(props.map);

    if (props.existingLayerView) {
      this.editingLayerGroup.addLayer(props.existingLayerView.layer);
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
          label: messages("fields:mapDrawingToolbar:createMarkerToolLabel"),
          imgSrc: "",
        },
        {
          type: "create-polyline-tool",
          label: messages("fields:mapDrawingToolbar:createPolylineToolLabel"),
        },
        {
          type: "create-polygon-tool",
          label: messages("fields:mapDrawingToolbar:createPolygonToolLabel"),
        },
      ],
      editing: {
        marker: [
          {
            type: "edit-marker-tool",
            label: messages("fields:mapDrawingToolbar:editMarkerToolLabel"),
          },
          {
            type: "delete-marker-tool",
            label: messages("fields:mapDrawingToolbar:deleteMarkerToolLabel"),
          },
        ],
        polyline: [
          {
            type: "edit-polyline-tool",
            label: messages("fields:mapDrawingToolbar:editPolylineToolLabel"),
          },
          {
            type: "delete-polyline-tool",
            label: messages("fields:mapDrawingToolbar:deletePolylineToolLabel"),
          },
          {
            type: "colorpicker-stroke-tool",
            mode: "stroke",
            label: messages("fields:mapDrawingToolbar:colorpickerStrokeToolLabel"),
          },
        ],
        polygon: [
          {
            type: "edit-polygon-tool",
            label: messages("fields:mapDrawingToolbar:editPolygonToolLabel"),
          },
          {
            type: "delete-polygon-tool",
            label: messages("fields:mapDrawingToolbar:deletePolygonToolLabel"),
          },
          {
            type: "colorpicker-fill-tool",
            mode: "fill",
            label: messages("fields:mapDrawingToolbar:colorpickerFillToolLabel"),
          },
          {
            type: "colorpicker-stroke-tool",
            mode: "stroke",
            label: messages("fields:mapDrawingToolbar:colorpickerStrokeToolLabel"),
          },
        ],
      },
      selectIcon: {
        header: messages("fields:mapDrawingToolbar:selectMarkerTypeHeader"),
      },
    };

    this.numVertices = 0;

    this.props.map.on("draw:drawvertex", this.handleDrawVertexEvent.bind(this));
    this.props.map.on("draw:created", this.handleDrawCreatedEvent.bind(this));
    this.props.map.on("draw:editvertex", this.handleEditEvent.bind(this));
    this.props.map.on("draw:editmove", this.handleEditEvent.bind(this));
    this.props.map.on("draw:edited", this.handleEditEvent.bind(this));

    if (this.props.existingLayerView) {
      this.props.existingLayerView.isEditing = true;
    }
  }

  handleDrawVertexEvent() {
    this.numVertices++;

    if (this.state.currentGeometryType === "polygon" && this.numVertices <= 2) {
      this.setState({
        headerMessage: messages(
          "fields:mapDrawingToolbar:createPolygonHeaderContinue",
        ),
      });
    } else if (
      this.state.currentGeometryType === "polygon" &&
      this.numVertices > 2
    ) {
      this.setState({
        headerMessage: messages(
          "fields:mapDrawingToolbar:createPolygonHeaderContinueOrFinish",
        ),
      });
    } else if (
      this.state.currentGeometryType === "polyline" &&
      this.numVertices === 1
    ) {
      this.setState({
        headerMessage: messages(
          "fields:mapDrawingToolbar:createPolylineHeaderContinue",
        ),
      });
    } else if (
      this.state.currentGeometryType === "polyline" &&
      this.numVertices > 1
    ) {
      this.setState({
        headerMessage: messages(
          "fields:mapDrawingToolbar:createPolylineHeaderContinueOrFinish",
        ),
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
      headerMessage = messages("fields:mapDrawingToolbar:editMarkerHeader");
      selectedEditingTool = "edit-marker-tool";
    } else if (this.state.currentGeometryType === "polyline") {
      headerMessage = messages("fields:mapDrawingToolbar:editPolylineHeader");
      selectedEditingTool = "edit-polyline-tool";
    } else if (this.state.currentGeometryType === "polygon") {
      headerMessage = messages("fields:mapDrawingToolbar:editPolygonHeader");
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
          headerMessage: messages("fields:mapDrawingToolbar:createMarkerHeader"),
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
          headerMessage: messages(
            "fields:mapDrawingToolbar:createPolylineHeaderInitial",
          ),
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
          headerMessage: messages(
            "fields:mapDrawingToolbar:createPolygonHeaderInitial",
          ),
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
        headerMessage: messages("fields:mapDrawingToolbar:selectToolHeader"),
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
          headerMessage: messages("fields:mapDrawingToolbar:editMarkerHeader"),
          currentPanel: "edit-marker",
          selectedDrawingTool: null,
          selectedEditingTool: evt.target.id,
        });
      } else if (evt.target.id === "edit-polyline-tool") {
        this.setState({
          headerMessage: messages("fields:mapDrawingToolbar:editPolylineHeader"),
          currentPanel: "edit-polyline",
          selectedDrawingTool: null,
          selectedEditingTool: evt.target.id,
        });
      } else if (evt.target.id === "edit-polygon-tool") {
        this.setState({
          headerMessage: messages("fields:mapDrawingToolbar:editPolygonHeader"),
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
        outputColorpickerState(this.colorpickerState),
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
      headerMessage: messages("fields:mapDrawingToolbar:selectToolHeader"),
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
    if (this.props.existingLayerView) {
      this.props.existingLayerView.isEditing = false;
      this.props.existingLayerView.render();
    }
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
            "select-geometry-type",
          ),
        },
      ),
      editingToolsContainer: classNames(
        "map-drawing-toolbar__editing-tools-container",
        {
          "map-drawing-toolbar__editing-tools-container--visible": this.getVisibility(
            "edit-geometry",
          ),
        },
      ),
      markerSelectionHeader: classNames(
        "map-drawing-toolbar__marker-selection-header",
        {
          "map-drawing-toolbar__marker-selection-header--visible": this.getVisibility(
            "select-marker-type",
          ),
        },
      ),
      markerSelectionContainer: classNames(
        "map-drawing-toolbar__marker-selection-container",
        {
          "map-drawing-toolbar__marker-selection-container--visible": this.getVisibility(
            "select-marker-type",
          ),
        },
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
            },
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
            },
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
              },
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
              },
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
  existingGeometry: PropTypes.object,
  existingGeometryStyle: PropTypes.object,
  existingLayerView: PropTypes.object,
  fieldConfig: PropTypes.shape({
    content: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
      }),
    ),
  }),
  map: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onGeometryStyleChange: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  markers: PropTypes.array.isRequired,
};

MapDrawingToolbar.defaultProps = {
  existingGeometry: null,
};

export default MapDrawingToolbar;
