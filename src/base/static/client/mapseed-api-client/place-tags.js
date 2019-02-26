const createPlaceTag = async (url, tagData) => {
  const response = await fetch(`${url}/tags`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    method: "POST",
    body: JSON.stringify(tagData),
  });

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create Place tag.", response.statusText);

    return null;
  }

  return await response.json();
};

const updatePlaceTag = async (url, newData) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    method: "PATCH",
    body: JSON.stringify(newData),
  });

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error(
      "Error: Failed to update Place tag note.",
      response.statusText,
    );

    return null;
  }

  return await response.json();
};

const deletePlaceTag = async url => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    method: "DELETE",
  });

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to delete Place tag.", response.statusText);

    return null;
  }

  return response;
};

export default {
  create: createPlaceTag,
  update: updatePlaceTag,
  delete: deletePlaceTag,
};
