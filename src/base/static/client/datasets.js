const getDatasets = async datasetUrls => {
  return Promise.all(
    datasetUrls.map(async datasetUrl => {
      const response = await fetch(datasetUrl, {
        credentials: "include",
      });

      if (response.status < 200 || response.status >= 300) {
        // eslint-disable-next-line no-console
        console.error("Error: Failed to fetch datasets.", response.statusText);

        return null;
      }

      return response.json();
    }),
  );
};

export default {
  get: getDatasets,
};
