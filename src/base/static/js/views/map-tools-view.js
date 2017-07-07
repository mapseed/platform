/* 
  A view responsible for managing optional map tools accessible from the 
  map tools Leaflet sidebar icon. Supported tools include:
  
    - layer comparison swipe
    - that's it for now!
*/

let GISLegendView = require("mapseed-gis-legend-view");

let toolViewDefs = {
  LayerSwipeView: Backbone.View.extend({

    initialize () {
      this.map = this.options.mapView.map;
      this.GISConfig = this.options.sidebarConfig.panels.filter(panel => panel.id === "gis-layers")[0];
      this.sbs;
      this.options.mapView.layerSwipeView = this;
    },

    fetchMapLayers () {
      let altBasemap = this.options.swipeConfig.alt_basemap;

      this.layers = {
        left: [],
        right: []
      };
      this.basemapIds = {
        left: "",
        right: ""
      };
      this.sbs = L.control.sideBySide(this.layers.left, this.layers.right);
      this.sbs.addTo(this.map);

      // Set up left basemap and layers, assuming layers loaded at swipe activation
      // time will make up the lefthand side of the map.
      for (let layerId in this.options.mapView.layers) {
        if (this.map.hasLayer(this.options.mapView.layers[layerId])) {
          if (this.GISConfig.basemaps.filter((basemap) => basemap.id === layerId).length === 1) {
            this.basemapIds.left = layerId;
          }
          this.layers.left.push(this.options.mapView.layers[layerId]);
        }
      }

      // Set up right basemap. No other layers are loaded on the righthand side 
      // initially. If our alternate basemap turns out to be the one already in 
      // use, set the alternate to be the visibleDefault basemap instead.
      this.basemapIds.right = (altBasemap === this.basemapIds.left) ? 
        this.GISConfig.basemaps.filter((basemap) => basemap.visibleDefault)[0] :
        altBasemap;
      $(Shareabouts).trigger("visibility", [altBasemap, true, true, "right"]);
    },

    render (isChecked) {
      if (isChecked) {
        this.options.mapView.isComparingLayers = true;
        this.fetchMapLayers();

        let data = {
          config: this.GISConfig
        };

        this.$el.html(Handlebars.templates["sidebar-right"](data));

        this.sidebar = L.control.sidebar("sidebar-right", {
          position: "left",
        });
        this.sidebar.addTo(this.map);

        new GISLegendView({
          el: "#gis-layers-right",
          mapView: this.options.mapView,
          config: data.config,
          sidebar: this.sidebar,
          sidebarConfig: this.options.sidebarConfig,
          position: "right",
          uniqueId: "right",
          rightBasemapId: this.basemapIds.right
        }).render();

        document.getElementById("sidebar-right").style.left = (this.sbs.getPosition() + 15) + "px";
        this.sbs.on("dividermove", (data) => {
          document.getElementById("sidebar-right").style.left = (data.x + 15) + "px";
        });
      } else if (this.sbs) {
        this.options.mapView.isComparingLayers = false;
        this.sbs.remove();
        this.map.removeLayer(this.options.mapView.layers[this.options.swipeConfig.alt_basemap]);
        this.map.eachLayer((layer) => {
          if (layer.getContainer) {

            // remove clips set by the layer swipe plugin
            layer.getContainer().style.clip = "initial";
            $("#sidebar-container-right").empty();
          }
        });
      }
    }
  }),
};

module.exports = Backbone.View.extend({
  events: {
    "change .tools-menu-item": "onToolChange",
  },

  initialize () {
    this.views = {};
    this.render();
  },

  onToolChange (evt) {
    let toolView = $(evt.currentTarget).data("toolview"),
        isChecked = $(evt.currentTarget).find("input").prop("checked");

    if (this.views[toolView]) {
      this.views[toolView].render(isChecked);
    } else {
      this.views[toolView] = new toolViewDefs[toolView]({
        el: "#sidebar-container-right",
        mapView: this.options.mapView,
        swipeConfig: this.options.panelConfig.tools.filter(tool => tool.name === "layer-swipe")[0],
        sidebarConfig: this.options.sidebarConfig
      });
      this.views[toolView].render(isChecked);
    }
  },

  render () {
    let data = {
      tools: this.options.panelConfig.tools
    };

    this.$el.html(Handlebars.templates["map-tools"](data));
  }
});
