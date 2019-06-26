const analyze = async ({ analyses, inputGeometry }) => {
  const response = await fetch(
    "https://tczvytgpjb.execute-api.us-west-2.amazonaws.com/v1",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        analyses,
        inputGeometry,
      }),
    },
  );

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error(
      "Error: Failed to perform geo analysis.",
      response.statusText,
    );

    return null;
  }

  return await response.json();
};

export default {
  analyze,
};
