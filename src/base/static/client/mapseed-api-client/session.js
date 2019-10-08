const getSessionToken = async apiRoot => {
  const response = await fetch(`${apiRoot}utils/session-key?format=json`, {
    credentials: "include",
  });

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch session token.", response.statusText);

    return null;
  }

  return await response.json();
};

export default {
  get: getSessionToken,
};
