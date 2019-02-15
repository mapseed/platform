const createSupport = async (placeUrl, supportData) => {
  const response = await fetch(`${placeUrl}/support`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    method: "POST",
    body: JSON.stringify(supportData),
  });

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create support.", response.statusText);

    return null;
  }

  return await response.json();
};

const deleteSupport = async (placeUrl, supportId) => {
  const response = await fetch(`${placeUrl}/support/${supportId}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    method: "DELETE",
  });

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to delete support.", response.statusText);

    return null;
  }

  return response;
};

export default {
  create: createSupport,
  delete: deleteSupport,
};
