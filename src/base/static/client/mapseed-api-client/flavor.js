import { Mixpanel } from "../../utils/mixpanel";

const getFlavor = async (apiRoot, flavorSlug) => {
  const response = await fetch(`${apiRoot}flavors/${flavorSlug}`, {
    credentials: "include",
  });

  if (response.status < 200 || response.status >= 300) {
    Mixpanel.track("Error", {
      message: "Failed to fetch flavor",
      error: response.statusText,
    });

    return null;
  }

  return await response.json();
};

export default {
  get: getFlavor,
};
