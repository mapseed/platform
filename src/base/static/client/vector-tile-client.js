export default {
  fetchLayers: async layersUrl => {
    const response = await window.fetch(layersUrl);
    const responseJSON = await response.json();

    return responseJSON.layers;
  },
};
