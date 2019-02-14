const createComment = async (placeUrl, commentData) => {
  try {
    const response = await fetch(`${placeUrl}/comments`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(commentData),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create comment.", err);
  }
};

const updateComment = async ({ placeUrl, commentId, commentData }) => {
  try {
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
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to update comment.", err);
  }
};

export default {
  create: createComment,
  update: updateComment,
};
