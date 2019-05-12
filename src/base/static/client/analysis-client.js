export default {
  fetchTargets: async placeDetail => {
    const analysisTargetPromises = placeDetail
      .filter(detail => detail.geospatialAnalysis)
      .map(detail => detail.geospatialAnalysis)
      .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
      .map(analysisConfig => analysisConfig.targetUrl)
      .reduce(
        (uniqueUrls, targetUrl) =>
          uniqueUrls.includes(targetUrl)
            ? uniqueUrls
            : [...uniqueUrls, targetUrl],
        [],
      )
      .map(targetUrl =>
        fetch(targetUrl)
          .then(response => response.json())
          .then(data => ({
            id: targetUrl,
            data,
          }))
          .catch(e => {
            // eslint-disable-next-line no-console
            console.error("Error: Failed to fetch analysis target:", e);
          }),
      )

    return Promise.all(analysisTargetPromises);
  },
};
