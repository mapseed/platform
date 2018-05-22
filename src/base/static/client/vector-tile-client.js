export default {
  fetchStyle: async styleUrl => {
    const response = await window.fetch(styleUrl);

    return response.json();
  },
};
