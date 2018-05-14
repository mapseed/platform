const notImplemented = () => {
  throw "Error: Method is not implemented for this mapping provider";
};

const abstractMethods = {
  /**
   * Create a new map instance.
   * @interface
   *
   * @param {string} container - The id of the DOM element that will hold the map.
   *
   * @param {Object} [options] - Generic map options applicable to all providers.
   * @param {number} [options.minZoom] - Minimum map zoom level allowed.
   * @param {number} [options.maxZoom] - Maximum map zoom level allowed.
   * @param {boolean} [options.attributionControl] - Whether to add an attribution to the map.
   * @param {Object} [options.maxBounds] - Maximum bounds extent allowed.
   * @param {number[]} [options.maxBounds.sw] - Southwest corner of allowed bounds, in [latitude, longitude] coordinates.
   * @param {number[]} [options.maxBounds.ne] - Northeast corner of allowed bounds, in [latitude, longitude] coordiantes.
   * @param {number} [options.zoom] - The initial zoom level of the map.
   *
   * @returns {Object} A reference to the map abstraction.
   */
  createMap: (container, options) => {
    notImplemented();
  },

  /**
   * Bind a map event listener.
   *
   * @param {"zoomstart"|"zoomend"|"movestart"|"moveend"|"dragstart"|"dragend"} - The event name.
   * @param {Object} callback - Function to call when the event is fired.
   * @param {Object} context - The context to which the callback should be bound before calling.
   *
   * @returns undefined
   */
  on: (event, callback, context) => {
    notImplemented();
  },

  /**
   * Unbind a map event listener.
   */
  off: (event, callback) => {
    notImplemented();
  },

  /**
   * Fire a map event.
   */
  fire: (event, payload) => {
    notImplemented();
  },

  /**
   * Create a WMS layer.
   * @returns {object} The layer instance.
   */
  createWMSLayer: (source, options) => {
    notImplemented();
  },

  /**
   * Create a WMTS layer.
   * @returns {object} The layer instance.
   */
  createWMTSLayer: (source, options) => {
    notImplemented();
  },

  /**
   * Create a GeoJSON layer.
   * @returns {object} The layer instance.
   */
  createGeoJSONLayer: (source, options) => {
    notImplemented();
  },

  /**
   * Create an ESRI layer.
   * @returns {object} The layer instance.
   */
  createESRILayer: (source, options) => {
    notImplemented();
  },

  /**
   * Create a tile layer.
   * @returns {object} The layer instance.
   */
  createTileLayer: (source, options) => {
    notImplemented();
  },

  /**
   * Create a vector tile layer.
   * @returns {object} The layer instance.
   */
  createVectorTileLayer: (source, options) => {
    notImplemented();
  },

  /**
   * Remove the passed layer from the map.
   */
  removeLayer: layer => {
    notImplemented();
  },

  /**
   * Add the passed layer to the map.
   */
  addLayer: layer => {
    notImplemented();
  },

  /**
   * Attempt to geolocate the map user.
   */
  locate: options => {
    notImplemented();
  },

  /**
   * Get the map's current zoom level.
   * @returns {number} The zoom level.
   */
  getZoom: () => {
    notImplemented;
  },

  /**
   * Get the map's current bounding box as a string.
   * @returns {string} The bounding box string.
   */
  getBBoxString: () => {
    notImplemented;
  },

  /**
   * Fit the map to the passed native map client bounds.
   */
  fitBounds: bounds => {
    notImplemented();
  },

  /**
   * Get the map's current center point.
   * @returns {string[]} The latitude, longitude center of the map as an array.
   */
  getCenter: () => {
    notImplemented();
  },
};

export default function(factory) {
  return Object.assign(abstractMethods, factory);
}
