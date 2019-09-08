import { point, lineString, polygon, featureCollection } from "@turf/helpers";
import area from "@turf/area";
import distance from "@turf/distance";
import { geoPath, geoTransform, GeoStream } from "d3-geo";
import {
  FeatureCollection,
  Feature,
  Point,
  LineString,
  Polygon,
} from "geojson";

const lng2tile = (lng, zoom) => {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
};

const lat2tile = (lat, zoom) => {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom),
  );
};

function* range(start, end, step = 1) {
  if (end === undefined) [end, start] = [start, 0];
  for (let n = start; n < end; n += step) yield n;
}

type ZoomLngLat = {
  zoom: number;
  lng: number;
  lat: number;
};

// Returns an array of absolute paths for each tile within the bounding box
// eg: [ "/8/43/89.pbf", "/8/43/90.pbf", "/8/44/89.pbf", "/8/44/90.pbf" ]
export const getTilePaths = (southWestPoint, northEastPoint) => {
  const MIN_ZOOM = 4; // inclusive
  const MAX_ZOOM = 10; // exclusive
  const { lng: minLng, lat: minLat } = southWestPoint;
  const { lng: maxLng, lat: maxLat } = northEastPoint;
  let zoom;
  const results: ZoomLngLat[] = [];
  for (zoom of range(MIN_ZOOM, MAX_ZOOM)) {
    const minLngTile = lng2tile(minLng, zoom);
    const maxLngTile = lng2tile(maxLng, zoom);
    let lng;
    for (lng of range(
      Math.min(minLngTile, maxLngTile),
      Math.max(minLngTile, maxLngTile) + 1,
    )) {
      const minLngTile = lat2tile(minLat, zoom);
      const maxLngTile = lat2tile(maxLat, zoom);
      let lat;
      for (lat of range(
        Math.min(minLngTile, maxLngTile),
        Math.max(minLngTile, maxLngTile) + 1,
      )) {
        results.push({ zoom, lat, lng });
      }
    }
  }
  return results;
};

///////////////////////////////////////////////////////////////////////////////
// Measurement tool utils
///////////////////////////////////////////////////////////////////////////////

export const MEASUREMENT_UNITS = {
  "create-polyline": "feet",
  "create-polygon": "acres",
};

const MIN_POSITIONS = {
  "create-polygon": 4, // Including final position matching the first.
  "create-polyline": 2,
};

export const buildMeasurementFeatureCollection = (
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
      console.error(
        `buildMeasurementFeatureCollection: unsupported tool ${selectedTool}`,
      );
      break;
  }

  return featureCollection(
    positions
      .map(position => point(position))
      .concat(
        // Only add the measurement feature if we have enough positions on
        // the map to support the given feature type.
        numPositions >= MIN_POSITIONS[selectedTool]
          ? featureFn(newPositions)
          : [],
      ),
  );
};

interface GeoTransformWrapper {
  stream: GeoStream;
}

export const redraw = ({ project, ctx, featureCollection, width, height }) => {
  function projectPoint(this: GeoTransformWrapper, lon, lat) {
    const point = project([lon, lat]);
    this.stream.point(point[0], point[1]);
  }

  const transform = geoTransform({ point: projectPoint });
  const path = geoPath()
    .projection(transform)
    .context(ctx);

  ctx.clearRect(0, 0, width, height);

  const { features } = featureCollection;
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

const FEET_PER_MILE = 5280;
const SQUARE_METERS_PER_ACRE = 0.000247105;
export const calculateMeasurement = (measurementFeature: Feature) => {
  const geometry = measurementFeature && measurementFeature.geometry;

  if (geometry && geometry.type == "LineString") {
    return (
      geometry.coordinates.reduce((total, nextCoords, i) => {
        return (
          i > 0 &&
          total +
            distance(geometry.coordinates[i - 1], nextCoords, {
              units: "miles",
            })
        );
      }, 0) * FEET_PER_MILE
    );
  } else if (geometry && geometry.type === "Polygon") {
    // NOTE: the `area` function always returns areas in square meters.
    return area(geometry) * SQUARE_METERS_PER_ACRE;
  } else {
    return 0;
  }
};
