const getFlavor = async (apiRoot, flavorSlug) => {
  const response = await fetch(`${apiRoot}flavors/${flavorSlug}`, {
    credentials: "include",
  });

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch flavor:", response.statusText);

    return null;
  }

  return await response.json();
};

export default {
  get: getFlavor,
};
