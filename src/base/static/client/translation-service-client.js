export default {
  translate: async ({ text, target, format }) => {
    const response = await fetch(
      "https://qnvmys9mc8.execute-api.us-west-2.amazonaws.com/v1",
      {
        method: "POST",
        body: JSON.stringify({
          text,
          target,
          format,
        }),
      },
    );

    if (response.status < 200 || response.status >= 300) {
      // eslint-disable-next-line no-console
      console.error("Error: Failed to translate content:", response.statusText);

      return null;
    }

    return await response.json();
  },
};
