import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

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
      ? config.propertiesToPluck.reduce((memo, property) => {
          return {
            ...memo,
            [property]: foundFeature.properties[property],
          };
        }, {})
      : null;
  },
  aggregatePointsInRadius: () => {},
};
