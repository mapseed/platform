const getActivity = async (datasetUrl, clientSlug) => {
  try {
    const response = await fetch(`${datasetUrl}/actions`, {
      credentials: "include",
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    const json = await response.json();

    // Note that activity is returned from the API in paginated form. Here we 
    // don't bother to fetch additional pages, assuming only the most recent 
    // page of activity is useful to the user.
    return await json.results.map(activity => ({
      ...activity,
      // Add the "client slug" to be used with activity from this dataset.
      // The client slug is used in urls in the client.
      _clientSlug: clientSlug,
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch actions.", err);
  }
};

export default {
  get: getActivity,
};
