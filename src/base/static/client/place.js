const status = response => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
};

// Turn GeoJSON FeatureCollections into plain objects of Place data.
const fromGeoJSONFeatureCollection = async ({
  featureCollection,
  datasetSlug,
  clientSlug,
}) =>
  await featureCollection.features.map(feature => ({
    geometry: feature.geometry,
    // Add a private field for the slug each Place belongs to, so we can
    // filter by dataset when we need to.
    _datasetSlug: datasetSlug,
    _clientSlug: clientSlug,
    ...feature.properties,
  }));

const buildQuerystring = params =>
  Object.entries(params).reduce((querystring, [param, value]) => {
    return `${querystring}&${param}=${value}`;
  }, "?");

const getPlaces = async ({
  url,
  placeParams,
  includePrivate,
  datasetSlug,
  clientSlug,
}) => {
  try {
    let firstPageMetadata;
    placeParams = includePrivate
      ? {
          ...placeParams,
          include_private_places: true,
          include_private_fields: true,
        }
      : placeParams;

    const firstPagePromise = fetch(`${url}${buildQuerystring(placeParams)}`, {
      credentials: "include",
    })
      .then(status)
      .then(data => data.json())
      .then(data => {
        // Peel off the first page's metadata so we can retain it before
        // transforming the first page from a GeoJSON collection.
        firstPageMetadata = data.metadata;

        return Promise.resolve(data);
      })
      .then(featureCollection =>
        fromGeoJSONFeatureCollection({
          featureCollection,
          datasetSlug,
          clientSlug,
        }),
      );

    const placePagePromises = [firstPagePromise];

    await firstPagePromise.then(data => {
      // Fetch additional pages of data, if they exist.
      if (firstPageMetadata.next) {
        const pageSize = data.length;
        const totalPages =
          pageSize > 0 ? Math.ceil(firstPageMetadata.length / pageSize) : 0;

        for (let i = 2; i <= totalPages; i++) {
          placeParams = { ...placeParams, page: i };
          placePagePromises.push(
            fetch(`${url}${buildQuerystring(placeParams)}`, {
              credentials: "include",
            })
              .then(status)
              .then(data => data.json())
              .then(featureCollection =>
                fromGeoJSONFeatureCollection({
                  featureCollection,
                  datasetSlug,
                  clientSlug,
                }),
              ),
          );
        }
      }
    });

    // Note that this method returns an array of Promises, each of which will
    // resolve to a page of Place data transformed from GeoJSON. We return
    // these Promises so the calling code can act on pages of data as they
    // resolve one by one.
    return placePagePromises.reduce(
      (flat, toFlatten) => flat.concat(toFlatten),
      [],
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch places.", err);
  }
};

export default {
  get: getPlaces,
  //create: createPlace,
  //update: updatePlace,
};
