const getUser = async apiRoot => {
  const response = await fetch(`${apiRoot}users/current?format=json`, {
    credentials: "include",
  });
  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create support.", response.statusText);

    return null;
  }

  return await response.json();
};

export default {
  get: getUser,
};
