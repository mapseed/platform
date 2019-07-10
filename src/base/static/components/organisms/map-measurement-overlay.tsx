/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { featureCollection, point, lineString, polygon } from "@turf/helpers";
import area from "@turf/area";
import distance from "@turf/distance";
import { geoPath, geoTransform } from "d3-geo";
import WebMercatorViewport from "viewport-mercator-project";
import { CanvasOverlay } from "react-map-gl";

import { RegularText } from "../atoms/typography";
import {
  CreatePolygonIcon,
  CreatePolylineIcon,
  DeleteGeometryIcon,
  UndoIcon,
} from "../atoms/icons";

const MeasurementToolIcon = styled("span")(props => ({
  border: "2px solid transparent",
  borderRadius: "4px",
  padding: "4px 4px 0 4px",
  marginRight: "8px",
  backgroundColor: props.isSelected ? "#999" : "initial",

  "&:hover": {
    borderColor: props.isEnabled ? "#999" : "transparent",
    cursor: props.isEnabled ? "pointer" : "unset",
  },
}));

MeasurementToolIcon.defaultProps = {
  isEnabled: true,
};

const FEET_PER_MILE = 5280;
const SQUARE_METERS_PER_ACRE = 0.000247105;
const measurementFormatter = new Intl.NumberFormat("en-US");
const MIN_POSITIONS = {
  "create-polygon": 4,
  "create-polyline": 2,
};

export default class MapMeasurementOverlay extends React.Component {
  state = {
    // NOTE: The structure of this featureCollection is such that all but the
    // last feature are Points representing clicked-on locations, and the final
    // feature is either a LineString or a Polygon built from those points. The
    // final feature is used for measurement purposes.
    featureCollection: featureCollection([]),
    selectedTool: null,
    measurement: null,
    units: null,
  };

  _getNewViewport = () =>
    new WebMercatorViewport({
      ...this.props.viewport,
      width: this.props.width,
      height: this.props.height,
    });

  _overlayRef = React.createRef();
  _webMercatorViewport = this._getNewViewport();
  _positions = [];

  componentDidMount() {
    // Unless I'm missing the right way to use overlays, it seems necessary
    // to attach a click listener here to capture clicks on the overlay.
    // See: https://github.com/uber/react-map-gl/issues/470
    if (this._overlayRef && this._overlayRef.current) {
      this._overlayRef.current._canvas.addEventListener("click", this._onClick);
      this._overlayRef.current._canvas.addEventListener(
        "mousemove",
        this._onMousemove,
      );
    } else {
      // eslint-disable-next-line no-console
      console.error(
        "Measurement overlay: failed to attach click event listener",
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.viewport !== prevProps.viewport ||
      this.props.height !== prevProps.height ||
      this.props.width !== prevProps.width
    ) {
      this._webMercatorViewport = this._getNewViewport();
    }

    if (this.state.featureCollection !== prevState.featureCollection) {
      // Geometry has been added or removed from the measurement
      // FeatureCollection.
      const { features } = this.state.featureCollection;
      const measurementFeature = features[features.length - 1];
      if (
        measurementFeature &&
        measurementFeature.geometry.type == "LineString"
      ) {
        this.setState({
          measurement:
            measurementFeature.geometry.coordinates.reduce(
              (total, nextCoords, i) => {
                return (
                  i > 0 &&
                  total +
                    distance(
                      measurementFeature.geometry.coordinates[i - 1],
                      nextCoords,
                      {
                        units: "miles",
                      },
                    )
                );
              },
              0,
            ) * FEET_PER_MILE,
        });
      } else if (
        measurementFeature &&
        measurementFeature.geometry.type === "Polygon"
      ) {
        this.setState({
          // NOTE: the `area` function always returns areas in square meters.
          measurement:
            area(measurementFeature.geometry) * SQUARE_METERS_PER_ACRE,
        });
      }
    }
  }

  componentWillUnmount() {
    this._overlayRef &&
      this._overlayRef.current &&
      this._overlayRef.current._canvas.removeEventListener("click");
  }

  _onMousemove = evt => {};

  _onClick = evt => {
    if (!this.state.selectedTool) {
      return;
    }

    const { left, top } = evt.currentTarget.getBoundingClientRect();

    // Get unprojected (i.e. lng/lat) coordinates from the x/y click position,
    // relative to the overlay canvas element.
    const unprojected = this._webMercatorViewport.unproject([
      evt.x - left,
      evt.y - top,
    ]);

    this._positions.push(unprojected);
    this._updateFeatureCollection();
  };

  _updateFeatureCollection = () => {
    let featureFn;
    let positions;
    let numPositions = 0;
    switch (this.state.selectedTool) {
      case "create-polygon":
        featureFn = polygon;
        // Ensure the last position of the Polygon matches the first.
        positions = [this._positions.concat([this._positions[0]])];
        numPositions = positions[0].length;
        break;
      case "create-polyline":
        featureFn = lineString;
        positions = this._positions;
        numPositions = positions.length;
        break;
      default:
        featureFn = () => [];
        positions = this._positions;
        // eslint-disable-next-line no-console
        console.error(
          `Measurement overlay: unsupported tool ${this.state.selectedTool}`,
        );
        break;
    }

    this.setState({
      featureCollection: featureCollection(
        this._positions.map(position => point(position)).concat(
          // Only add the measurement feature if we have enough positions on
          // the map.
          numPositions >= MIN_POSITIONS[this.state.selectedTool]
            ? featureFn(positions)
            : [],
        ),
      ),
    });
  };

  _redraw = ({ project, isDragging, ctx }) => {
    function projectPoint(lon, lat) {
      const point = project([lon, lat]);
      /* eslint-disable-next-line no-invalid-this */
      this.stream.point(point[0], point[1]);
    }

    if (this.props.renderWhileDragging || !isDragging) {
      const transform = geoTransform({ point: projectPoint });
      const path = geoPath()
        .projection(transform)
        .context(ctx);
      this._drawFeatures(ctx, path);
    }
  };

  _drawFeatures(ctx, path) {
    ctx.clearRect(0, 0, this.props.width, this.props.height);

    const { features } = this.state.featureCollection;
    if (!features) {
      return;
    }

    for (const feature of features) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(245, 241, 17, 0.8)"; // Bright yellow.
      ctx.lineWidth = "2";
      ctx.fillStyle = "rgba(188, 0, 0, 0.5)";
      const geometry = feature.geometry;
      path({
        type: geometry.type,
        coordinates: geometry.coordinates,
      });
      this.state.selectedTool === "create-polygon" && ctx.fill();
      ctx.stroke();
    }
  }

  _undoLastPoint = () => {
    this._positions.pop();
    this._updateFeatureCollection();
  };

  _reset = () => {
    this._positions = [];
    this.setState({
      featureCollection: featureCollection([]),
      selectedTool: null,
      units: null,
      measurement: null,
    });
  };

  _formatMeasurement = measurement =>
    isNaN(measurement)
      ? null
      : measurementFormatter.format(measurement.toFixed(1));

  render() {
    const { selectedTool, units, measurement, featureCollection } = this.state;

    return (
      <React.Fragment>
        <CanvasOverlay
          featureCollection={featureCollection}
          ref={this._overlayRef}
          captureClick={true}
          redraw={this._redraw}
        />
        <div
          css={css`
            position: absolute;
            right: 8px;
            bottom: 8px;
            background-color: rgba(255, 255, 255, 0.85);
            padding: 8px;
            border-radius: 8px;
            width: 225px;
            min-width: 225px;
          `}
        >
          <RegularText
            css={css`
              display: block;
              margin-bottom: 8px;
              font-family: courier, sans-serif;
            `}
          >
            {selectedTool
              ? `Total ${units}: ${this._formatMeasurement(measurement)}`
              : "Measurement tools"}
          </RegularText>
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <div
              css={css`
                border-right: 1px solid #999;
                display: flex;
                align-items: center;
                margin-right: 8px;
              `}
            >
              <MeasurementToolIcon
                isSelected={selectedTool === "create-polyline"}
                onClick={() => {
                  if (selectedTool === "create-polyline") {
                    return;
                  }

                  this.setState({
                    selectedTool: "create-polyline",
                    measurement: 0,
                    units: "feet",
                  });
                }}
              >
                <CreatePolylineIcon />
              </MeasurementToolIcon>
              <MeasurementToolIcon
                isSelected={selectedTool === "create-polygon"}
                onClick={() => {
                  if (selectedTool === "create-polygon") {
                    return;
                  }

                  this.setState({
                    selectedTool: "create-polygon",
                    measurement: 0,
                    units: "acres",
                  });
                }}
              >
                <CreatePolygonIcon />
              </MeasurementToolIcon>
            </div>
            <div
              css={css`
                display: flex;
                align-items: center;
              `}
            >
              <MeasurementToolIcon
                onClick={this._undoLastPoint}
                isEnabled={!!selectedTool}
              >
                <UndoIcon color={selectedTool ? "#000" : "#999"} />
              </MeasurementToolIcon>
              <MeasurementToolIcon
                isEnabled={!!selectedTool}
                onClick={() => this.setState({ selectedTool: null })}
              >
                <DeleteGeometryIcon
                  onClick={this._reset}
                  color={selectedTool ? "#000" : "#999"}
                />
              </MeasurementToolIcon>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
