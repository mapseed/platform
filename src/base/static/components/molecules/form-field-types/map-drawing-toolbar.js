import classNames from "classnames";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import ColorPicker from "rc-color-picker";
import "rc-color-picker/assets/index.css";

import {
  activeMarkerSelector,
  setMarkers,
  setActiveMarkerIndex,
  visibleDrawingToolsSelector,
  markerPanelVisibilitySelector,
  activeDrawingToolSelector,
  setActiveDrawingTool,
  activeColorpickerSelector,
  setActiveColorpicker,
  geometryStyleSelector,
  setGeometryStyle,
  resetDrawingToolbarState,
  setActiveDrawGeometryId,
  markerSelector,
  geometryStyleProps,
} from "../../../state/ducks/map-drawing-toolbar";
import {
  updateDrawModeActive,
  updateGeoJSONSourceRemoveFeature,
  updateGeoJSONSourceAddFeature,
} from "../../../state/ducks/map";
import { placeSelector } from "../../../state/ducks/places";

import { ToolbarButton } from "../../atoms/buttons";
import { Paragraph } from "../../atoms/typography";

import emitter from "../../../utils/emitter";
import constants from "../../../constants";

import "./map-drawing-toolbar.scss";

const deleteToolLabels = {
  "create-marker": "deleteMarkerToolLabel",
  "create-polyline": "deletePolylineToolLabel",
  "create-polygon": "deletePolygonToolLabel",
};

// NOTE: The ColorPicker component, which consumes these two ToolbarButton
// components, tries to attach a ref to its children, so these components
// need to be classes.
class StrokeColorpickerToolbarButton extends Component {
  render() {
    return (
      <ToolbarButton
        classes={classNames(
          "map-drawing-toolbar__tool-icon",
          "map-drawing-toolbar__tool-icon--colorpicker",
          {
            "map-drawing-toolbar__tool-icon--colorpicker--active":
              this.props.activeColorpicker ===
              constants.DRAW_STROKE_COLORPICKER_NAME,
          },
        )}
        label={this.props.label}
        icon="/static/css/images/colorpicker-icon.svg"
        onClick={this.props.onClick}
      />
    );
  }
}

StrokeColorpickerToolbarButton.propTypes = {
  activeColorpicker: PropTypes.string,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

class FillColorpickerToolbarButton extends Component {
  render() {
    return (
      <ToolbarButton
        classes={classNames(
          "map-drawing-toolbar__tool-icon",
          "map-drawing-toolbar__tool-icon--colorpicker",
          {
            "map-drawing-toolbar__tool-icon--colorpicker--active":
              this.props.activeColorpicker ===
              constants.DRAW_FILL_COLORPICKER_NAME,
          },
        )}
        label={this.props.label}
        icon="/static/css/images/colorpicker-icon.svg"
        onClick={this.props.onClick}
      />
    );
  }
}

FillColorpickerToolbarButton.propTypes = {
  activeColorpicker: PropTypes.string,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

class MapDrawingToolbar extends Component {
  componentDidMount() {
    this.props.updateDrawModeActive(true);
    this.props.resetDrawingToolbarState();
    this.props.setMarkers(this.props.markers);
    this.drawUpdateListener = emitter.addListener(
      "draw:update-geometry",
      geometry => {
        this.props.onChange(this.props.name, geometry);
      },
    );

    if (this.props.existingGeometry) {
      // If we are editing existing geometry on the map, remove the underlying
      // feature from its source and relocate it to mapbox-gl-draw so it can
      // be manipulated.
      this.props.updateGeoJSONSourceRemoveFeature(
        this.props.datasetSlug,
        this.props.existingPlaceId,
      );

      switch (this.props.existingGeometry.type) {
        case "Point":
          this.props.setActiveDrawingTool(constants.DRAW_CREATE_MARKER_TOOL);
          this.props.setMarkers(this.props.markers);
          this.props.setGeometryStyle(this.props.existingGeometryStyle);
          this.props.setActiveMarkerIndex(
            this.props.markers.indexOf(
              this.props.existingGeometryStyle[
                constants.MARKER_ICON_PROPERTY_NAME
              ],
            ),
          );
          break;
        case "LineString":
          this.props.setActiveDrawingTool(constants.DRAW_CREATE_POLYLINE_TOOL);
          this.props.setGeometryStyle(this.props.existingGeometryStyle);
          break;
        case "Polygon":
          this.props.setActiveDrawingTool(constants.DRAW_CREATE_POLYGON_TOOL);
          this.props.setGeometryStyle(this.props.existingGeometryStyle);
          break;
      }
    }
  }

  componentWillUnmount() {
    this.drawUpdateListener.remove();
    this.props.updateDrawModeActive(false);
    this.props.setActiveDrawGeometryId(null);
    // In edit mode, restore the original geometry removed on mount to make way
    // for the editable geometry.
    this.props.existingPlaceId &&
      this.props.updateGeoJSONSourceAddFeature(
        this.props.datasetSlug,
        this.props.placeSelector(this.props.existingPlaceId),
      );
  }

  render() {
    const isCreateMarkerToolDisabled =
      !!this.props.activeDrawingTool &&
      this.props.activeDrawingTool !== constants.DRAW_CREATE_MARKER_TOOL;
    const isCreatePolylineToolDisabled =
      !!this.props.activeDrawingTool &&
      this.props.activeDrawingTool !== constants.DRAW_CREATE_POLYLINE_TOOL;
    const isCreatePolygonToolDisabled =
      !!this.props.activeDrawingTool &&
      this.props.activeDrawingTool !== constants.DRAW_CREATE_POLYGON_TOOL;

    return (
      <div className="map-drawing-toolbar">
        <Paragraph classes="map-drawing-toolbar__drawing-tools-header">
          {this.props.t("selectToolHeader")}
        </Paragraph>
        <div className="map-drawing-toolbar__grid-container">
          <div className="map-drawing-toolbar__drawing-tools-container">
            <ToolbarButton
              classes={classNames("map-drawing-toolbar__tool-icon", {
                "map-drawing-toolbar__tool-icon--active":
                  this.props.activeDrawingTool ===
                  constants.DRAW_CREATE_MARKER_TOOL,
                "map-drawing-toolbar__tool-icon--disabled":
                  !!this.props.activeDrawingTool &&
                  this.props.activeDrawingTool !==
                    constants.DRAW_CREATE_MARKER_TOOL,
              })}
              label={this.props.t("createMarkerToolLabel")}
              icon="/static/css/images/create-marker-icon.svg"
              onClick={() => {
                if (
                  this.props.activeDrawingTool ===
                    constants.DRAW_CREATE_MARKER_TOOL ||
                  isCreateMarkerToolDisabled
                ) {
                  return;
                }
                this.props.setActiveDrawingTool(
                  constants.DRAW_CREATE_MARKER_TOOL,
                );
              }}
            />
            <ToolbarButton
              classes={classNames("map-drawing-toolbar__tool-icon", {
                "map-drawing-toolbar__tool-icon--active":
                  this.props.activeDrawingTool ===
                  constants.DRAW_CREATE_POLYLINE_TOOL,
                "map-drawing-toolbar__tool-icon--disabled":
                  !!this.props.activeDrawingTool &&
                  this.props.activeDrawingTool !==
                    constants.DRAW_CREATE_POLYLINE_TOOL,
              })}
              label={this.props.t("createPolylineToolLabel")}
              icon="/static/css/images/create-polyline-icon.svg"
              onClick={() => {
                if (
                  this.props.activeDrawingTool ===
                    constants.DRAW_CREATE_POLYLINE_TOOL ||
                  isCreatePolylineToolDisabled
                ) {
                  return;
                }
                this.props.setActiveDrawingTool(
                  constants.DRAW_CREATE_POLYLINE_TOOL,
                );
              }}
            />
            <ToolbarButton
              classes={classNames("map-drawing-toolbar__tool-icon", {
                "map-drawing-toolbar__tool-icon--active":
                  this.props.activeDrawingTool ===
                  constants.DRAW_CREATE_POLYGON_TOOL,
                "map-drawing-toolbar__tool-icon--disabled":
                  !!this.props.activeDrawingTool &&
                  this.props.activeDrawingTool !==
                    constants.DRAW_CREATE_POLYGON_TOOL,
              })}
              label={this.props.t("createPolygonToolLabel")}
              icon="/static/css/images/create-polygon-icon.svg"
              onClick={() => {
                if (
                  this.props.activeDrawingTool ===
                    constants.DRAW_CREATE_POLYGON_TOOL ||
                  isCreatePolygonToolDisabled
                ) {
                  return;
                }
                this.props.setActiveDrawingTool(
                  constants.DRAW_CREATE_POLYGON_TOOL,
                );
              }}
            />
          </div>
          <div className="map-drawing-toolbar__editing-tools-container">
            {/* 
                This ternary is a workaround due to the fact that there is no
                way to disable the colorpicker plugin's trigger once it's 
                rendered. When the colorpicker is active we render the toolbar
                button wrapped in the colorpicker trigger. When it's inactive, 
                we just render an inactive toolbar button.
                https://github.com/react-component/color-picker/issues/70 
            */}
            {this.props.activeDrawingTool ===
              constants.DRAW_CREATE_POLYGON_TOOL ||
            this.props.activeDrawingTool ===
              constants.DRAW_CREATE_POLYLINE_TOOL ? (
              <ColorPicker
                color={
                  this.props.geometryStyle[constants.LINE_COLOR_PROPERTY_NAME]
                }
                alpha={
                  this.props.geometryStyle[
                    constants.LINE_OPACITY_PROPERTY_NAME
                  ] * 100
                }
                mode="RGB"
                enableAlpha={true}
                onOpen={() => {
                  this.props.setActiveColorpicker(
                    constants.DRAW_STROKE_COLORPICKER_NAME,
                  );
                }}
                onClose={() => {
                  this.props.setActiveColorpicker(null);
                }}
                onChange={colorInfo => {
                  this.props.setGeometryStyle({
                    ...this.props.geometryStyle,
                    stroke: colorInfo.color,
                    "stroke-opacity": colorInfo.alpha / 100,
                  });
                }}
                placement="topRight"
              >
                <StrokeColorpickerToolbarButton
                  activeColorpicker={this.props.activeColorpicker}
                  label={this.props.t("colorpickerStrokeToolLabel")}
                />
              </ColorPicker>
            ) : (
              <ToolbarButton
                classes={classNames(
                  "map-drawing-toolbar__tool-icon",
                  "map-drawing-toolbar__tool-icon--colorpicker",
                  "map-drawing-toolbar__tool-icon--disabled",
                )}
                label={this.props.t("colorpickerStrokeToolLabel")}
                icon="/static/css/images/colorpicker-icon.svg"
              />
            )}
            {this.props.activeDrawingTool ===
            constants.DRAW_CREATE_POLYGON_TOOL ? (
              <ColorPicker
                color={
                  this.props.geometryStyle[constants.FILL_COLOR_PROPERTY_NAME]
                }
                alpha={
                  this.props.geometryStyle[
                    constants.FILL_OPACITY_PROPERTY_NAME
                  ] * 100
                }
                mode="RGB"
                enableAlpha={true}
                onOpen={() => {
                  this.props.setActiveColorpicker(
                    constants.DRAW_FILL_COLORPICKER_NAME,
                  );
                }}
                onClose={() => {
                  this.props.setActiveColorpicker(null);
                }}
                onChange={colorInfo => {
                  this.props.setGeometryStyle({
                    ...this.props.geometryStyle,
                    fill: colorInfo.color,
                    "fill-opacity": colorInfo.alpha / 100,
                  });
                }}
                placement="topRight"
              >
                <FillColorpickerToolbarButton
                  label={this.props.t("colorpickerFillToolLabel")}
                  activeColorpicker={this.props.activeColorpicker}
                />
              </ColorPicker>
            ) : (
              <ToolbarButton
                classes={classNames(
                  "map-drawing-toolbar__tool-icon",
                  "map-drawing-toolbar__tool-icon--colorpicker",
                  "map-drawing-toolbar__tool-icon--disabled",
                )}
                label={this.props.t("colorpickerFillToolLabel")}
                icon="/static/css/images/colorpicker-icon.svg"
              />
            )}

            <ToolbarButton
              classes={classNames("map-drawing-toolbar__tool-icon", {
                "map-drawing-toolbar__tool-icon--disabled": !this.props
                  .activeDrawingTool,
              })}
              label={this.props.t(
                deleteToolLabels[this.props.activeDrawingTool] || "delete",
              )}
              icon="/static/css/images/delete-geometry-icon.svg"
              onClick={() => {
                this.props.setGeometryStyle({
                  [constants.FILL_COLOR_PROPERTY_NAME]:
                    constants.DRAW_DEFAULT_FILL_COLOR,
                  [constants.FILL_OPACITY_PROPERTY_NAME]:
                    constants.DRAW_DEFAULT_FILL_OPACITY,
                  [constants.LINE_COLOR_PROPERTY_NAME]:
                    constants.DRAW_DEFAULT_LINE_COLOR,
                  [constants.LINE_OPACITY_PROPERTY_NAME]:
                    constants.DRAW_DEFAULT_LINE_OPACITY,
                });
                this.props.setActiveDrawingTool(null);
              }}
            />
          </div>
        </div>
        {this.props.activeDrawingTool === constants.DRAW_CREATE_MARKER_TOOL && (
          <div className="map-drawing-toolbar___markers-panel">
            <Paragraph classes="map-drawing-toolbar__markers-container-header">
              {this.props.t("selectMarkerTypeHeader")}
            </Paragraph>
            <div className="map-drawing-toolbar__markers-container">
              {this.props.markers.map((marker, i) => (
                <ToolbarButton
                  key={i}
                  classes={classNames("map-drawing-toolbar__marker-icon", {
                    "map-drawing-toolbar__marker-icon--active":
                      marker === this.props.activeMarker,
                  })}
                  icon={marker}
                  prefix="/static/css/images/markers/"
                  onClick={() => {
                    this.props.setActiveMarkerIndex(i);
                    this.props.setGeometryStyle({
                      "marker-symbol": this.props.markerSelector(i),
                    });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

MapDrawingToolbar.propTypes = {
  activeColorpicker: PropTypes.string,
  activeDrawingTool: PropTypes.string,
  activeMarker: PropTypes.string,
  existingGeometry: PropTypes.object,
  existingPlaceId: PropTypes.number,
  existingGeometryStyle: PropTypes.object,
  datasetSlug: PropTypes.string,
  geometryStyle: geometryStyleProps,
  isMarkerPanelVisible: PropTypes.bool.isRequired,
  markers: PropTypes.arrayOf(PropTypes.string),
  markerSelector: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeSelector: PropTypes.func.isRequired,
  resetDrawingToolbarState: PropTypes.func.isRequired,
  setActiveColorpicker: PropTypes.func.isRequired,
  setActiveDrawGeometryId: PropTypes.func.isRequired,
  setActiveDrawingTool: PropTypes.func.isRequired,
  setActiveMarkerIndex: PropTypes.func.isRequired,
  setGeometryStyle: PropTypes.func.isRequired,
  setMarkers: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  updateDrawModeActive: PropTypes.func.isRequired,
  updateGeoJSONSourceAddFeature: PropTypes.func.isRequired,
  updateGeoJSONSourceRemoveFeature: PropTypes.func.isRequired,
  visibleDrawingTools: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  activeColorpicker: activeColorpickerSelector(state),
  activeDrawingTool: activeDrawingToolSelector(state),
  activeMarker: activeMarkerSelector(state),
  isMarkerPanelVisible: markerPanelVisibilitySelector(state),
  geometryStyle: geometryStyleSelector(state),
  markerSelector: markerIndex => markerSelector(state, markerIndex),
  placeSelector: placeId => placeSelector(state, placeId),
  visibleDrawingTools: visibleDrawingToolsSelector(state),
});

const mapDispatchToProps = dispatch => ({
  resetDrawingToolbarState: () => dispatch(resetDrawingToolbarState()),
  setActiveColorpicker: activeColorpicker =>
    dispatch(setActiveColorpicker(activeColorpicker)),
  setActiveDrawGeometryId: id => dispatch(setActiveDrawGeometryId(id)),
  setActiveMarkerIndex: activeMarkerIndex =>
    dispatch(setActiveMarkerIndex(activeMarkerIndex)),
  setActiveDrawingTool: activeDrawingTool =>
    dispatch(setActiveDrawingTool(activeDrawingTool)),
  setGeometryStyle: geometryStyle => dispatch(setGeometryStyle(geometryStyle)),
  setMarkers: markers => dispatch(setMarkers(markers)),
  updateDrawModeActive: isActive => dispatch(updateDrawModeActive(isActive)),
  updateGeoJSONSourceAddFeature: (sourceId, place) =>
    dispatch(updateGeoJSONSourceAddFeature(sourceId, place)),
  updateGeoJSONSourceRemoveFeature: (sourceId, featureId) =>
    dispatch(updateGeoJSONSourceRemoveFeature(sourceId, featureId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("MapDrawingToolbar")(MapDrawingToolbar));
