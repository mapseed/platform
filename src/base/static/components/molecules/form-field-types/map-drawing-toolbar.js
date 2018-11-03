import classNames from "classnames";
import React, { Component } from "react";
import { Map } from "immutable";
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
} from "../../../state/ducks/map-drawing-toolbar";

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

class MapDrawingToolbar extends Component {
  componentDidMount() {
    this.props.resetDrawingToolbarState();
    this.props.setMarkers(this.props.markers);
    emitter.addListener(constants.DRAW_UPDATE_GEOMETRY_EVENT, geometry => {
      this.props.onChange(this.props.name, geometry);
    });

    if (this.props.existingGeometry) {
      emitter.emit(
        constants.DRAW_INIT_GEOMETRY_EVENT,
        this.props.existingGeometry.toJS(),
      );
      switch (
        this.props.existingGeometry.get(constants.GEOMETRY_TYPE_PROPERTY_NAME)
      ) {
        case "Point":
          this.props.setActiveDrawingTool(constants.DRAW_CREATE_MARKER_TOOL);
          this.props.setMarkers(this.props.markers);
          this.props.setActiveMarkerIndex(
            this.props.markers.indexOf(
              this.props.existingGeometryStyle.toJS()[
                constants.MARKER_ICON_PROPERTY_NAME
              ],
            ),
          );
          break;
        case "LineString":
          this.props.setActiveDrawingTool(constants.DRAW_CREATE_POLYLINE_TOOL);
          this.props.setGeometryStyle(this.props.existingGeometryStyle.toJS());
          break;
        case "Polygon":
          this.props.setActiveDrawingTool(constants.DRAW_CREATE_POLYGON_TOOL);
          this.props.setGeometryStyle(this.props.existingGeometryStyle.toJS());
          break;
      }

      emitter.emit(constants.PLACE_COLLECTION_HIDE_PLACE_EVENT, {
        collectionId: this.props.existingCollectionId,
        modelId: this.props.existingModelId,
      });
    }
  }

  render() {
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
                  constants.DRAW_CREATE_MARKER_TOOL
                ) {
                  return;
                }
                this.props.setActiveDrawingTool(
                  constants.DRAW_CREATE_MARKER_TOOL,
                );
                emitter.emit(constants.DRAW_START_MARKER_EVENT);
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
                  constants.DRAW_CREATE_POLYLINE_TOOL
                ) {
                  return;
                }
                this.props.setActiveDrawingTool(
                  constants.DRAW_CREATE_POLYLINE_TOOL,
                );
                emitter.emit(constants.DRAW_START_POLYLINE_EVENT);
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
                  constants.DRAW_CREATE_POLYGON_TOOL
                ) {
                  return;
                }
                this.props.setActiveDrawingTool(
                  constants.DRAW_CREATE_POLYGON_TOOL,
                );
                emitter.emit(constants.DRAW_START_POLYGON_EVENT);
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
                    [constants.LINE_COLOR_PROPERTY_NAME]: colorInfo.color,
                    [constants.LINE_OPACITY_PROPERTY_NAME]:
                      colorInfo.alpha / 100,
                  });
                }}
                placement="topRight"
              >
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
                  label={this.props.t("colorpickerStrokeToolLabel")}
                  icon="/static/css/images/colorpicker-icon.svg"
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
                    [constants.FILL_COLOR_PROPERTY_NAME]: colorInfo.color,
                    [constants.FILL_OPACITY_PROPERTY_NAME]:
                      colorInfo.alpha / 100,
                  });
                }}
                placement="topRight"
              >
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
                  label={this.props.t("colorpickerFillToolLabel")}
                  icon="/static/css/images/colorpicker-icon.svg"
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
                emitter.emit(constants.DRAW_DELETE_GEOMETRY_EVENT);
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
  existingCollectionId: PropTypes.string,
  existingGeometry: PropTypes.instanceOf(Map),
  existingModelId: PropTypes.number,
  existingGeometryStyle: PropTypes.instanceOf(Map),
  geometryStyle: PropTypes.shape({
    [constants.LINE_COLOR_PROPERTY_NAME]: PropTypes.string.isRequired,
    [constants.LINE_OPACITY_PROPERTY_NAME]: PropTypes.number.isRequired,
    [constants.FILL_COLOR_PROPERTY_NAME]: PropTypes.string.isRequired,
    [constants.FILL_OPACITY_PROPERTY_NAME]: PropTypes.number.isRequired,
  }).isRequired,
  isMarkerPanelVisible: PropTypes.bool.isRequired,
  markers: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  resetDrawingToolbarState: PropTypes.func.isRequired,
  setActiveColorpicker: PropTypes.func.isRequired,
  setActiveDrawingTool: PropTypes.func.isRequired,
  setActiveMarkerIndex: PropTypes.func.isRequired,
  setGeometryStyle: PropTypes.func.isRequired,
  setMarkers: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  visibleDrawingTools: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  activeColorpicker: activeColorpickerSelector(state),
  activeDrawingTool: activeDrawingToolSelector(state),
  activeMarker: activeMarkerSelector(state),
  isMarkerPanelVisible: markerPanelVisibilitySelector(state),
  geometryStyle: geometryStyleSelector(state),
  visibleDrawingTools: visibleDrawingToolsSelector(state),
});

const mapDispatchToProps = dispatch => ({
  resetDrawingToolbarState: () => dispatch(resetDrawingToolbarState()),
  setActiveColorpicker: activeColorpicker =>
    dispatch(setActiveColorpicker(activeColorpicker)),
  setActiveMarkerIndex: activeMarkerIndex =>
    dispatch(setActiveMarkerIndex(activeMarkerIndex)),
  setActiveDrawingTool: activeDrawingTool =>
    dispatch(setActiveDrawingTool(activeDrawingTool)),
  setGeometryStyle: geometryStyle => dispatch(setGeometryStyle(geometryStyle)),
  setMarkers: markers => dispatch(setMarkers(markers)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("MapDrawingToolbar")(MapDrawingToolbar));
