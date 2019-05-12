import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import buffer from "@turf/buffer";
import pointsWithinPolygon from "@turf/points-within-polygon";
import booleanOverlap from "@turf/boolean-overlap";
import booleanContains from "@turf/boolean-contains";
import flatten from "@turf/flatten";
import hash from "object-hash";
import { featureCollection } from "@turf/helpers";

import { Mixpanel } from "./mixpanel";

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

// Returns an array of absolute paths for each tile within the bounding box
// eg: [ "/8/43/89.pbf", "/8/43/90.pbf", "/8/44/89.pbf", "/8/44/90.pbf" ]
export const getTilePaths = (southWestPoint, northEastPoint) => {
  const MIN_ZOOM = 4; // inclusive
  const MAX_ZOOM = 10; // exclusive
  const { lng: minLng, lat: minLat } = southWestPoint;
  const { lng: maxLng, lat: maxLat } = northEastPoint;
  let zoom;
  const results = [];
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

const getBufferFeature = (placeGeometry, bufferOptions) => {
  try {
    return buffer(placeGeometry, bufferOptions.distance, {
      units: bufferOptions.units,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    Mixpanel.track("Error", {
      message: "unable to perform getBufferFeature",
      error: e,
    });

    return null;
  }
};

const pointInPolygon = ({
  config = { propertiesToPluck: [] },
  targetFeatures,
  placeGeometry,
}) => {
  // Find the first polygon in which the passed point resides.
  let foundFeature;
  try {
    foundFeature = targetFeatures.find(feature => {
      return booleanPointInPolygon(placeGeometry, feature);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    Mixpanel.track("Error", {
      message: "unable to perform booleanPointInPolygon on features",
      error: e,
    });

    return {};
  }

  return config.propertiesToPluck.reduce(
    (pluckedProperties, property) => ({
      ...pluckedProperties,
      [property.name]: foundFeature
        ? foundFeature.properties[property.name]
        : property.fallbackValue,
    }),
    {},
  );
};

const aggregatePointsInBuffer = ({ placeGeometry, targetFeatures, config }) => {
  const bufferFeature = getBufferFeature(placeGeometry, config.buffer);

  if (!bufferFeature) {
    return {};
  }

  let pointsWithin;
  try {
    pointsWithin = pointsWithinPolygon(
      featureCollection(targetFeatures),
      bufferFeature,
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("ERROR!", e);
    Mixpanel.track("Error", {
      message: "unable to perform pointsWithinPolygon on features",
      error: e,
    });

    pointsWithin = featureCollection([]); // Empty FeatureCollection.
  }

  if (config.aggregator.type === "totalCount") {
    return {
      [config.name]: pointsWithin.features.length,
    };
  } else if (config.aggregator.type === "countByUniquePropertyValues") {
    // Return an object that counts the number of occurrences of each unique
    // value of `config.aggregator.property` in the set of points in the
    // buffer, producing an object like:
    // {
    //   propertyA: 3,
    //   propertyB: 7,
    //   ...
    // }
    const uniqueValues = pointsWithin.features.reduce(
      (memo, feature) => ({
        ...memo,
        [feature.properties[config.aggregator.property]]: memo[
          feature.properties[config.aggregator.property]
        ]
          ? ++memo[feature.properties[config.aggregator.property]]
          : 1,
      }),
      {},
    );

    return {
      [config.name]: uniqueValues,
    };
  } else {
    // eslint-disable-next-line no-console
    console.error(
      "Error: invalid aggregator type passed to aggregatePointsInBuffer:",
      config.aggregator.type,
    );
    return {};
  }
};

const aggregatePolygonsOverlappingBuffer = ({
  placeGeometry,
  targetFeatures,
  config,
}) => {
  const bufferFeature = getBufferFeature(placeGeometry, config.buffer);

  if (!bufferFeature) {
    return {};
  }

  const uniqueOverlappingFeatures = targetFeatures
    .reduce((memo, feature) => {
      if (feature.geometry.type === "MultiPolygon") {
        // Flatten any MultiPolygons to arrays of individual Polygon features,
        // because `booleanOverlap` can only compare like feature types.
        try {
          feature = flatten(feature).features;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          Mixpanel.track("Error", {
            message: "unable to perform flatten on features",
            error: e,
          });

          feature = [];
        }
      }

      return memo.concat(feature);
    }, [])
    .filter(feature => {
      try {
        return (
          // Technically, we're doing more than an overlap comparison here.
          // `boooleanOverlap` returns features which are strictly overlapping; we
          // also want to return features which are entirely contained by the
          // buffer.
          booleanOverlap(bufferFeature, feature) ||
          booleanContains(bufferFeature, feature)
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        Mixpanel.track("Error", {
          message:
            "unable to perform booleanOverlap and booleanContains on features",
          error: e,
        });

        return false;
      }
    })
    .reduce(
      ({ propertyHashes, features }, feature) => {
        // We need to de-dupe the array of `overlappingFeatures`. Duplicate
        // features might exist because Mapbox's `querySourceFeatures()` method
        // sometimes returns duplicates due to the nature of vector tiles.
        // See: https://docs.mapbox.com/mapbox-gl-js/api/#map#querysourcefeatures
        //
        // Duplicates might also exist as a result of flattening a MultiPolygon
        // above. We determine duplicate features by comparing hashes of their
        // properties objects, since we don't have reliable access to a unique
        // feature id for third-party data sources.
        const propertyHash = hash(feature.properties);
        if (!propertyHashes.has(propertyHash)) {
          propertyHashes.add(propertyHash);
          return {
            propertyHashes,
            features: [...features, feature],
          };
        } else {
          return {
            propertyHashes,
            features,
          };
        }
      },
      { propertyHashes: new Set(), features: [] },
    ).features;

  if (config.aggregator.type === "totalCount") {
    return {
      [config.name]: uniqueOverlappingFeatures.length,
    };
  } else {
    // eslint-disable-next-line no-console
    console.error(
      "Error: invalid aggregator type passed to aggregatePolygonsOverlappingBuffer:",
      config.aggregator.type,
    );
    return {};
  }
  // TODO: Other types of aggregations.
};

export const geoAnalyze = ({ config, targetFeatures, placeGeometry }) => {
  switch (config.type) {
    case "pointInPolygon":
      return pointInPolygon({ config, targetFeatures, placeGeometry });
    case "aggregatePointsInBuffer":
      return aggregatePointsInBuffer({ placeGeometry, targetFeatures, config });
    case "aggregatePolygonsOverlappingBuffer":
      return aggregatePolygonsOverlappingBuffer({
        placeGeometry,
        targetFeatures,
        config,
      });
    default:
      // eslint-disable-next-line no-console
      console.error("Error: unknown geospatial analysis type:", config.type);
      break;
  }
};
