const getDatasets = async datasetUrls => {
  try {
    return Promise.all(
      datasetUrls.map(async datasetUrl => {
        const response = await fetch(datasetUrl, {
          credentials: "include",
        });

        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }

        return response.json();
      }),
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch datasets.", err);
  }
};

export default {
  get: getDatasets,
};
