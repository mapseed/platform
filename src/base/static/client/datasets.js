const getDatasets = async datasetUrls => {
  try {
    const datasetPromises = [];
    datasetUrls.forEach(async datasetUrl => {
      const response = await fetch(datasetUrl, {
        credentials: "include",
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      }

      datasetPromises.push(response.json());
    });

    return await Promise.all(datasetPromises);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch datasets.", err);
  }
};

export default {
  get: getDatasets,
};
