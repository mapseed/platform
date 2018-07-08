import React, { Component } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import ColorPicker from "rc-color-picker";
import "rc-color-picker/assets/index.css";

import {
  activeMarkerSelector,
  setActiveMarker,
  visibleDrawingToolsSelector,
  markerPanelVisibilitySelector,
  activeDrawingToolSelector,
  setActiveDrawingTool,
} from "../../../state/ducks/map-drawing-toolbar";

import { ToolbarButton } from "../../atoms/buttons";
import { Paragraph } from "../../atoms/typography";

import emitter from "../../../utils/emitter";

import "./map-drawing-toolbar.scss";

const deleteToolLabels = {
  "create-marker": "deleteMarkerToolLabel",
  "create-polyline": "deletePolylineToolLabel",
  "create-polygon": "deletePolygonToolLabel",
};

class MapDrawingToolbar extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    emitter.addListener("draw:update-geometry", geometry => {
      this.props.onChange(this.props.name, this.geometry);
      //this.props.onGeometryStyleChange(style);
    });
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
                  this.props.activeDrawingTool === "create-marker",
                "map-drawing-toolbar__tool-icon--unselectable":
                  !!this.props.activeDrawingTool &&
                  this.props.activeDrawingTool !== "create-marker",
              })}
              label={this.props.t("createMarkerToolLabel")}
              icon="/static/css/images/create-marker-icon.svg"
              onClick={() => {
                if (
                  !!this.props.activeDrawingTool &&
                  this.props.activeDrawingTool !== "create-marker"
                ) {
                  return;
                }
                this.props.setActiveDrawingTool("create-marker");
                emitter.emit("draw:start-marker");
              }}
            />
            <ToolbarButton
              classes={classNames("map-drawing-toolbar__tool-icon", {
                "map-drawing-toolbar__tool-icon--active":
                  this.props.activeDrawingTool === "create-polyline",
                "map-drawing-toolbar__tool-icon--unselectable":
                  !!this.props.activeDrawingTool &&
                  this.props.activeDrawingTool !== "create-polyline",
              })}
              label={this.props.t("createPolylineToolLabel")}
              icon="/static/css/images/create-polyline-icon.svg"
              onClick={() => {
                if (
                  !!this.props.activeDrawingTool &&
                  this.props.activeDrawingTool !== "create-polyline"
                ) {
                  return;
                }
                this.props.setActiveDrawingTool("create-polyline");
                emitter.emit("draw:start-polyline");
              }}
            />
            <ToolbarButton
              classes={classNames("map-drawing-toolbar__tool-icon", {
                "map-drawing-toolbar__tool-icon--active":
                  this.props.activeDrawingTool === "create-polygon",
                "map-drawing-toolbar__tool-icon--unselectable":
                  !!this.props.activeDrawingTool &&
                  this.props.activeDrawingTool !== "create-polygon",
              })}
              label={this.props.t("createPolygonToolLabel")}
              icon="/static/css/images/create-polygon-icon.svg"
              onClick={() => {
                if (
                  !!this.props.activeDrawingTool &&
                  this.props.activeDrawingTool !== "create-polygon"
                ) {
                  return;
                }
                this.props.setActiveDrawingTool("create-polygon");
                emitter.emit("draw:start-polygon");
              }}
            />
          </div>
          <div className="map-drawing-toolbar__editing-tools-container">
            <ColorPicker
              color="#ff0000"
              alpha="1"
              mode="RGB"
              enableAlpha={true}
              onChange={colorInfo => {
                console.log(colorInfo);
                emitter.emit("draw:style-change");
              }}
              placement="topRight"
            >
              <ToolbarButton
                classes={classNames("map-drawing-toolbar__tool-icon", {
                  "map-drawing-toolbar__tool-icon--unselectable":
                    this.props.activeDrawingTool !== "create-polyline" &&
                    this.props.activeDrawingTool !== "create-polygon",
                })}
                label={this.props.t("colorpickerStrokeToolLabel")}
                icon="/static/css/images/colorpicker-icon.svg"
                onClick={() => {}}
              />
            </ColorPicker>
            <ToolbarButton
              classes={classNames("map-drawing-toolbar__tool-icon", {
                "map-drawing-toolbar__tool-icon--unselectable":
                  this.props.activeDrawingTool !== "create-polygon",
              })}
              label={this.props.t("colorpickerFillToolLabel")}
              icon="/static/css/images/colorpicker-icon.svg"
              onClick={() => {}}
            />
            <ToolbarButton
              classes={classNames("map-drawing-toolbar__tool-icon", {
                "map-drawing-toolbar__tool-icon--unselectable": !this.props
                  .activeDrawingTool,
              })}
              label={this.props.t(
                deleteToolLabels[this.props.activeDrawingTool] || "delete",
              )}
              icon="/static/css/images/delete-geometry-icon.svg"
              onClick={() => {
                this.props.setActiveDrawingTool(null);
                emitter.emit("draw:delete");
              }}
            />
          </div>
        </div>
        {this.props.activeDrawingTool === "create-marker" && (
          <div className="map-drawing-toolbar___markers-panel">
            <Paragraph classes="map-drawing-toolbar__markers-container-header">
              {this.props.t("selectMarkerTypeHeader")}
            </Paragraph>
            <div className="map-drawing-toolbar__markers-container">
              {this.props.markers.map(marker => (
                <ToolbarButton
                  key={marker}
                  classes={classNames("map-drawing-toolbar__marker-icon", {
                    "map-drawing-toolbar__marker-icon--active":
                      marker === this.props.activeMarker,
                  })}
                  icon={marker}
                  onClick={() => {
                    this.props.setActiveMarker(marker);
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
  activeDrawingTool: PropTypes.string,
  activeMarker: PropTypes.string,
  isMarkerPanelVisible: PropTypes.bool.isRequired,
  markers: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  setActiveDrawingTool: PropTypes.func.isRequired,
  setActiveMarker: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  visibleDrawingTools: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  activeDrawingTool: activeDrawingToolSelector(state),
  activeMarker: activeMarkerSelector(state),
  visibleDrawingTools: visibleDrawingToolsSelector(state),
  isMarkerPanelVisible: markerPanelVisibilitySelector(state),
});

const mapDispatchToProps = dispatch => ({
  setActiveMarker: activeMarker => dispatch(setActiveMarker(activeMarker)),
  setActiveDrawingTool: activeDrawingTool =>
    dispatch(setActiveDrawingTool(activeDrawingTool)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("MapDrawingToolbar")(MapDrawingToolbar));
