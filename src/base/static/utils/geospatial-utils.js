import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import buffer from "@turf/buffer";
import pointsWithinPolygon from "@turf/points-within-polygon";

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
    const bufferFeature = buffer(
      {
        type: "Point",
        coordinates: placeCoordinates,
      },
      config.buffer.distance,
      {
        units: config.buffer.units,
      },
    );

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
        [config.name]: uniqueValues
      };
    } else {
      return {
        [config.name]: pointsWithin.features.length,
      };
    }
  },
  // TODO
  polygonsOverlapping: () => {}
};
