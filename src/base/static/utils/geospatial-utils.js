import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import buffer from "@turf/buffer";
import pointsWithinPolygon from "@turf/points-within-polygon";
import booleanOverlap from "@turf/boolean-overlap";
import booleanContains from "@turf/boolean-contains";
import flatten from "@turf/flatten";
import hash from "object-hash";

const getBufferFeature = (placeCoordinates, bufferOptions) => {
  return buffer(
    {
      type: "Point",
      coordinates: placeCoordinates,
    },
    bufferOptions.distance,
    {
      units: bufferOptions.units,
    },
  );
};

export default {
  // TODO: Handle non-polygonal data gracefully
  pointInPolygon: ({
    config = { propertiesToPluck: [] },
    sourceFeatures,
    placeCoordinates,
  }) => {
    // Find the first polygon in which the passed point resides.
    let foundFeature;
    try {
      foundFeature = sourceFeatures.find(feature => {
        return booleanPointInPolygon(placeCoordinates, feature);
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      return {};
    }

    return foundFeature
      ? config.propertiesToPluck.reduce(
          (memo, property) => ({
            ...memo,
            [property.name]: foundFeature.properties[property.name],
          }),
          {},
        )
      : config.propertiesToPluck.reduce(
          (memo, property) => ({
            ...memo,
            [property.name]: property.fallbackValue,
          }),
          {},
        );
  },
  aggregatePointsInBuffer: ({ placeCoordinates, sourceFeatures, config }) => {
    const bufferFeature = getBufferFeature(placeCoordinates, config.buffer);
    const pointsWithin = pointsWithinPolygon(
      {
        type: "FeatureCollection",
        features: sourceFeatures,
      },
      bufferFeature,
    );

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
      return {
        [config.name]: pointsWithin.features.length,
      };
    }
  },
  aggregatePolygonsOverlappingBuffer: ({
    placeCoordinates,
    sourceFeatures,
    config,
  }) => {
    const bufferFeature = getBufferFeature(placeCoordinates, config.buffer);

    sourceFeatures = sourceFeatures.reduce((memo, feature) => {
      if (feature.geometry.type === "MultiPolygon") {
        // Flatten any MultiPolygons to arrays of individual Polygon features,
        // because `booleanOverlap` can only compare like feature types.
        feature = flatten(feature).features;
      }

      return memo.concat(feature);
    }, []);

    let overlappingFeatures = sourceFeatures.filter(feature => {
      return (
        // Technically, we're doing more than an overlap comparison here.
        // `boooleanOverlap` returns features which are strictly overlapping; we
        // also want to return features which are entirely contained by the
        // buffer.
        booleanOverlap(bufferFeature, feature) ||
        booleanContains(bufferFeature, feature)
      );
    });

    const propertyHashes = new Set();
    overlappingFeatures = overlappingFeatures.filter(overlappingFeature => {
      // We need to de-dupe the array of `overlappingFeatures`. Duplicate
      // features might exist because Mapbox's `querySourceFeatures()` method
      // sometimes returns duplicates due to the nature of vector tiles.
      // See: https://docs.mapbox.com/mapbox-gl-js/api/#map#querysourcefeatures
      //
      // Duplicates might also exist as a result of flattening a MultiPolygon
      // above. In both cases we want to remove any duplicates as duplicates
      // will throw off the aggregation we return. We determine duplicate
      // features by comparing hashes of their properties objects, since we
      // don't have reliable access to a unique feature id for third-party data
      // sources.
      // See: https://github.com/mapbox/mapbox-gl-js/issues/6019
      const propertyHash = hash(overlappingFeature.properties);

      if (propertyHashes.has(propertyHash)) {
        return false;
      }

      propertyHashes.add(propertyHash);

      return true;
    });

    if (config.aggregator.type === "totalCount") {
      return {
        [config.name]: overlappingFeatures.length,
      };
    } else {
      return {
        [config.name]: overlappingFeatures.length,
      };
    }
    // TODO: Other types of aggregations.
  },
};
