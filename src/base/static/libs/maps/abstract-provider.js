const notImplemented = () => {
  throw new Error("Method is not implemented for this mapping provider");
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
  createMap: function(/*container, options, vendorOptions*/) {
    notImplemented();
  },

  /**
   * Bind a map event listener.
   *
   * @param {"zoomstart"|"zoomend"|"movestart"|"moveend"|"dragstart"|"dragend"} event - The event name.
   * @param {Object} callback - Function to call when the event is fired.
   * @param {Object} context - The context to which the callback should be bound before calling.
   *
   * @returns undefined
   */
  on: function(/*event, callback, context*/) {
    notImplemented();
  },

  /**
   * Unbind a map event listener.
   */
  off: function(/*event, callback*/) {
    notImplemented();
  },

  /**
   * Fire a map event.
   */
  fire: function(/*event, payload*/) {
    notImplemented();
  },

  /**
   * Add navigation (zoom, compass, etc.) controls to the map.
   *
   * @param {Object} options
   * @param {"top-left"|"top-right"|"bottom-left"|"bottom-right"} options.position="top-left" - The position of the controls within the map container.
   * @param {Object} [vendorOptions] - Vendor-specific options.
   *
   * @returns {Object} - The controls instance.
   */
  addNavControl: function(/*{ options, vendorOptions }*/) {
    notImplemented();
  },

  /**
   * Create a WMS layer.
   *
   * @returns {Object} -  The layer instance.
   */
  createWMSLayer: function(/*source, options*/) {
    notImplemented();
  },

  /**
   * Create a WMTS layer.
   *
   * @returns {Object} -  The layer instance.
   */
  createWMTSLayer: function(/*source, options*/) {
    notImplemented();
  },

  /**
   * Create a GeoJSON layer.
   *
   * @returns {Object} - The layer instance.
   */
  createGeoJSONLayer: function(/*source, options*/) {
    notImplemented();
  },

  /**
   * Create an ESRI layer.
   *
   * @returns {Object} - The layer instance.
   */
  createESRILayer: function(/*source, options*/) {
    notImplemented();
  },

  /**
   * Create a tile layer.
   *
   * @returns {Object} - The layer instance.
   */
  createTileLayer: function(/*source, options*/) {
    notImplemented();
  },

  /**
   * Create a vector tile layer.
   *
   * @returns {Object} - The layer instance.
   */
  createVectorTileLayer: function(/*source, options*/) {
    notImplemented();
  },

  /**
   * Remove the passed layer from the map.
   */
  removeLayer: function(/*layer*/) {
    notImplemented();
  },

  /**
   * Add the passed layer to the map.
   */
  addLayer: function(/*layer*/) {
    notImplemented();
  },

  addMapboxStyle: function(/*styleUrl*/) {
    notImplemented();
  },

  /**
   * Check whether a given layer has been added to the map.
   *
   * @param {string} layerId - The id of the layer to check for.
   *
   * @returns {boolean} - true or false
   */
  hasLayer: function(/*layerId*/) {
    notImplemented();
  },

  /**
   * Attempt to geolocate the map user.
   */
  locate: function(/*options*/) {
    notImplemented();
  },

  /**
   * Get the map's current zoom level.
   *
   * @returns {number} The zoom level.
   */
  getZoom: function() {
    notImplemented();
  },

  /**
   * Get the map's current bounding box as a string.
   *
   * @returns {string} The bounding box string.
   */
  getBBoxString: function() {
    notImplemented();
  },

  /**
   * Fit the map to the passed native map client bounds.
   */
  fitBounds: function(/*bounds*/) {
    notImplemented();
  },

  /**
   * Get the map's current center point.
   * @returns {string[]} The latitude, longitude center of the map as an array.
   */
  getCenter: () => {
    notImplemented();
  },

  /**
   * Set the map's maximum zoom level.
   *
   * @param {number} zoom - The zom level.
   *
   * @returns undefined
   */
  setMaxZoom: function(/*zoom*/) {
    notImplemented();
  },

  /**
   * Resize the map inside its container.
   *
   * @returns undefined.
   */
  invalidateSize: function() {
    notImplemented();
  },
};

export default function(factory) {
  return Object.assign(abstractMethods, factory);
}
