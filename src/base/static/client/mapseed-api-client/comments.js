const createComment = async (placeUrl, commentData) => {
  const response = await fetch(`${placeUrl}/comments`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    method: "POST",
    body: JSON.stringify(commentData),
  });

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create comment.", response.statusText);

    return null;
  }

  return await response.json();
};

const updateComment = async ({ placeUrl, commentId, commentData }) => {
  const response = await fetch(
    `${placeUrl}/comments/${commentId}?include_invisible`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Shareabouts-Silent": true, // To prevent new Actions on update.
      },
      credentials: "include",
      method: "PUT",
      body: JSON.stringify(commentData),
    },
  );

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to update comment.", response.statusText);

    return null;
  }

  return await response.json();
};

export default {
  create: createComment,
  update: updateComment,
};
