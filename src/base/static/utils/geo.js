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
