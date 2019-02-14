const createSupport = async (placeUrl, supportData) => {
  try {
    const response = await fetch(`${placeUrl}/support`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(supportData),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create support.", err);
  }
};

const deleteSupport = async (placeUrl, supportId) => {
  try {
    const response = await fetch(`${placeUrl}/support/${supportId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "DELETE",
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    return response;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to delete support.", err);
  }
};

export default {
  create: createSupport,
  delete: deleteSupport,
};
