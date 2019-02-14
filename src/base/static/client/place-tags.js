const createPlaceTag = async (url, tagData) => {
  try {
    const response = await fetch(`${url}/tags`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(tagData),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create Place tag.", err);
  }
};

const updatePlaceTag = async (url, newData) => {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(newData),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to update Place tag note.", err);
  }
};

const deletePlaceTag = async url => {
  try {
    const response = await fetch(url, {
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
    console.error("Error: Failed to delete Place tag.", err);
  }
};

export default {
  create: createPlaceTag,
  update: updatePlaceTag,
  delete: deletePlaceTag,
};
