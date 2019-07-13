/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { featureCollection, point, lineString, polygon } from "@turf/helpers";
import area from "@turf/area";
import distance from "@turf/distance";
import { geoPath, geoTransform } from "d3-geo";
import WebMercatorViewport, {
  WebMercatorViewportOptions,
} from "viewport-mercator-project";
import { CanvasOverlay } from "react-map-gl";
import {
  FeatureCollection,
  Feature,
  Point,
  LineString,
  Polygon,
} from "geojson";

import { mapViewportPropType } from "../../state/ducks/map";
import { RegularText } from "../atoms/typography";
import {
  CreatePolygonIcon,
  CreatePolylineIcon,
  DeleteGeometryIcon,
  UndoIcon,
} from "../atoms/icons";

const mapMeasurementOverlayProps = {
  viewport: mapViewportPropType.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

interface ExposedCanvasOverlay extends CanvasOverlay {
  _canvas: HTMLCanvasElement;
}

type MapMeasurementOverlayProps = PropTypes.InferProps<
  typeof mapMeasurementOverlayProps
>;

type MeasurementToolIconProps = {
  isEnabled: boolean;
  isSelected?: boolean;
  children: any;
  onClick: any;
};

const MeasurementToolIcon = (props: MeasurementToolIconProps) => (
  <span
    onClick={props.onClick}
    css={css`
      border: 2px solid transparent;
      border-radius: 4px;
      padding: 4px 4px 0 4px;
      margin-right: 8px;
      background-color: ${props.isSelected ? "#999" : "initial"};

      &:hover {
        border-color: ${props.isEnabled ? "#999" : "transparent"};
        cursor: ${props.isEnabled ? "pointer" : "unset"};
      }
    `}
  >
    {props.children}
  </span>
);

MeasurementToolIcon.defaultProps = {
  isEnabled: true,
};

const FEET_PER_MILE = 5280;
const SQUARE_METERS_PER_ACRE = 0.000247105;
const measurementFormatter = new Intl.NumberFormat("en-US");
const MIN_POSITIONS = {
  "create-polygon": 4, // Including final position matching the first.
  "create-polyline": 2,
};

const getNewViewport = ({
  latitude,
  longitude,
  zoom,
  pitch,
  bearing,
  altitude,
  width,
  height,
}: WebMercatorViewportOptions): WebMercatorViewport =>
  new WebMercatorViewport({
    latitude,
    longitude,
    zoom,
    pitch,
    bearing,
    altitude,
    width,
    height,
  });

const buildMeasurementFeatureCollection = (
  selectedTool: string,
  positions: number[][],
): FeatureCollection<Point | LineString | Polygon> => {
  let featureFn;
  let newPositions;
  let numPositions = 0;
  switch (selectedTool) {
    case "create-polygon":
      featureFn = polygon;
      // Ensure the last position of the Polygon matches the first.
      newPositions = [positions.concat([positions[0]])];
      numPositions = newPositions[0].length;
      break;
    case "create-polyline":
      featureFn = lineString;
      newPositions = positions;
      numPositions = newPositions.length;
      break;
    default:
      featureFn = () => [];
      newPositions = positions;
      // eslint-disable-next-line no-console
      console.error(`Measurement overlay: unsupported tool ${selectedTool}`);
      break;
  }

  return featureCollection(
    positions.map(position => point(position)).concat(
      // Only add the measurement feature if we have enough positions on
      // the map to support the given feature type.
      numPositions >= MIN_POSITIONS[selectedTool]
        ? featureFn(newPositions)
        : [],
    ),
  );
};

const redraw = ({
  project,
  ctx,
  measurementFeatureCollection,
  width,
  height,
}) => {
  function projectPoint(this: any, lon, lat) {
    const point = project([lon, lat]);
    this.stream.point(point[0], point[1]);
  }

  const transform = geoTransform({ point: projectPoint });
  const path = geoPath()
    .projection(transform)
    .context(ctx);

  ctx.clearRect(0, 0, width, height);

  const { features } = measurementFeatureCollection;
  if (!features) {
    return;
  }

  for (const feature of features) {
    const geometry = feature.geometry;

    ctx.beginPath();
    geometry.type !== "Point" && ctx.setLineDash([2, 2]);
    ctx.strokeStyle =
      geometry.type === "Point" ? "rgba(255,255,255,1)" : "rgba(251,176,59,1)"; // Orange.
    ctx.lineWidth = "2";
    ctx.fillStyle =
      geometry.type === "Point" ? "rgba(251,176,59,1)" : "rgba(251,176,59,0.2)";
    path({
      type: geometry.type,
      coordinates: geometry.coordinates,
    });
    geometry.type !== "LineString" && ctx.fill();
    ctx.stroke();
  }
};

const formatMeasurement = measurement =>
  isNaN(measurement)
    ? null
    : measurementFormatter.format(measurement.toFixed(1));

const MapMeasurementOverlay: React.FunctionComponent<
  MapMeasurementOverlayProps
> = props => {
  // NOTE: The structure of this featureCollection is such that all but the
  // last feature are Points representing clicked-on locations, and the final
  // feature is either a LineString or a Polygon built from those points. The
  // final feature is used for measurement purposes.
  const [
    measurementFeatureCollection,
    setMeasurementFeatureCollection,
  ] = React.useState<FeatureCollection<Point | LineString | Polygon>>(
    featureCollection([]),
  );
  const selectedTool = React.useRef<null | string>(null);
  const [measurement, setMeasurement] = React.useState<null | number>(null);
  const [units, setUnits] = React.useState<null | string>(null);
  const positions = React.useRef<number[][]>([]);
  const webMercatorViewport = React.useRef<WebMercatorViewport>();
  const overlayRef = React.useRef<ExposedCanvasOverlay>(null);

  const handleOverlayClick = evt => {
    if (!selectedTool.current) {
      return;
    }

    const { left, top } = evt.currentTarget.getBoundingClientRect();
    // Get unprojected (i.e. lng/lat) coordinates from the x/y click position,
    // relative to the overlay canvas element.
    const unprojected =
      webMercatorViewport.current &&
      webMercatorViewport.current.unproject([evt.x - left, evt.y - top]);

    unprojected && positions.current.push(unprojected);
    selectedTool.current &&
      setMeasurementFeatureCollection(
        buildMeasurementFeatureCollection(
          selectedTool.current,
          positions.current,
        ),
      );
  };

  const handleUndoLastPoint = () => {
    positions.current.pop();
    selectedTool.current &&
      setMeasurementFeatureCollection(
        buildMeasurementFeatureCollection(
          selectedTool.current,
          positions.current,
        ),
      );
  };

  const handleReset = () => {
    positions.current = [];
    setMeasurementFeatureCollection(featureCollection([]));
    selectedTool.current = null;
    setUnits(null);
    setMeasurement(null);
    if (overlayRef.current) {
      overlayRef.current._canvas.style.pointerEvents = "none";
    }
  };

  React.useEffect(() => {
    // Unless I'm missing the right way to use overlays, it seems necessary
    // to attach a click listener here to capture clicks on the overlay.
    // See: https://github.com/uber/react-map-gl/issues/470
    if (overlayRef && overlayRef.current && overlayRef.current._canvas) {
      overlayRef.current._canvas.addEventListener("click", handleOverlayClick);
      // This direct manipulation of the `pointer-events` style property feels
      // like a hack, but the goal is to enable clicks on the underlying map
      // when no measurement tool is selected.
      overlayRef.current._canvas.style.pointerEvents = "none";
    } else {
      // eslint-disable-next-line no-console
      console.error(
        "Measurement overlay: failed to attach click event listener",
      );
    }

    return () => {
      overlayRef &&
        overlayRef.current &&
        overlayRef.current._canvas.removeEventListener(
          "click",
          handleOverlayClick,
        );
    };
  }, []);

  React.useEffect(
    () => {
      webMercatorViewport.current = getNewViewport({
        ...props.viewport,
        width: props.width,
        height: props.height,
      });
    },
    [props.viewport, props.width, props.height],
  );

  React.useEffect(
    () => {
      const {
        features,
      }: { features: Feature[] } = measurementFeatureCollection;
      const measurementFeature = features[features.length - 1] as Feature;
      const geometry = measurementFeature.geometry;

      if (geometry && geometry.type == "LineString") {
        setMeasurement(
          geometry.coordinates.reduce((total, nextCoords, i) => {
            return (
              i > 0 &&
              total +
                distance(geometry.coordinates[i - 1], nextCoords, {
                  units: "miles",
                })
            );
          }, 0) * FEET_PER_MILE,
        );
      } else if (geometry && geometry.type === "Polygon") {
        // NOTE: the `area` function always returns areas in square meters.
        setMeasurement(area(geometry) * SQUARE_METERS_PER_ACRE);
      } else {
        setMeasurement(0);
      }
    },
    [measurementFeatureCollection],
  );

  return (
    <React.Fragment>
      <CanvasOverlay
        ref={overlayRef}
        captureClick={!!selectedTool.current}
        redraw={props =>
          redraw({
            ...props,
            measurementFeatureCollection,
            height: props.height,
            width: props.width,
          })
        }
      />
      <div
        onClick={evt => evt.stopPropagation()}
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
          {selectedTool.current
            ? `Total ${units}: ${formatMeasurement(measurement)}`
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
              isSelected={selectedTool.current === "create-polyline"}
              onClick={() => {
                if (selectedTool.current === "create-polyline") {
                  return;
                }

                if (overlayRef.current) {
                  overlayRef.current._canvas.style.pointerEvents = "initial";
                }
                selectedTool.current = "create-polyline";
                setMeasurement(0);
                setUnits("feet");
              }}
            >
              <CreatePolylineIcon />
            </MeasurementToolIcon>
            <MeasurementToolIcon
              isSelected={selectedTool.current === "create-polygon"}
              onClick={() => {
                if (selectedTool.current === "create-polygon") {
                  return;
                }

                if (overlayRef.current) {
                  overlayRef.current._canvas.style.pointerEvents = "initial";
                }
                selectedTool.current = "create-polygon";
                setMeasurement(0);
                setUnits("acres");
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
              onClick={handleUndoLastPoint}
              isEnabled={!!selectedTool.current}
            >
              <UndoIcon color={selectedTool.current ? "#000" : "#999"} />
            </MeasurementToolIcon>
            <MeasurementToolIcon
              isEnabled={!!selectedTool.current}
              onClick={() => (selectedTool.current = null)}
            >
              <DeleteGeometryIcon
                onClick={handleReset}
                color={selectedTool.current ? "#000" : "#999"}
              />
            </MeasurementToolIcon>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default MapMeasurementOverlay;
