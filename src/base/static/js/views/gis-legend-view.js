var LayerInfoWindowView = require("./layer-info-window-view.js");
const INFO_WINDOW_LEFT_OFFSET_ADJUST = 36;
const INFO_WINDOW_TOP_OFFSET_ADJUST = -67;
const INFO_WINDOW_SCROLL_HIDE_THRESHOLD = 25;

module.exports = Backbone.View.extend({
  events: {
    "change .map-legend-basemap-radio": "toggleBasemap",
    "change .map-legend-checkbox": "toggleVisibility",
    "change .map-legend-grouping-checkbox": "toggleHeaderVisibility",
    "click .info-icon": "onClickInfoIcon"
  },

  initialize: function() {
    this.options.mapView.map.on("layer:loading", this.onLayerLoading.bind(this));
    this.options.mapView.map.on("layer:loaded", this.onLayerLoaded.bind(this));
    this.options.mapView.map.on("layer:error", this.onLayerError.bind(this));

    this.hasScrolled = false;
    this.initialScrollPoint;
    this.options.sidebarView.$("#gis-layers-pane")
      .off("scroll")
      .on("scroll", this.onLayersPaneScroll.bind(this));
  },

  onLayerLoading: function(data) {
    this
      .$("#map-" + data.id + "~.status-icon")
      .empty()
      .removeClass("error loaded");

    new Spinner({
      lines: 8, length: 0, width: 2, radius: 4, corners: 1, rotate: 0,
      direction: 1, color: '#000', speed: 1, trail: 60, shadow: false,
      hwaccel: false, className: 'spinner', zIndex: 2e9, top: '2px',
      left: '-13px'
    }).spin(this.$("#map-" + data.id + "~.status-icon")[0]);
  },

  onLayerLoaded: function(data) {
    this
      .$("#map-" + data.id + "~.status-icon")
      .empty()
      .addClass("loaded");
  },

  onLayerError: function(data) {
    this
      .$("#map-" + data.id + "~.status-icon")
      .empty()
      .addClass("error");
  },

  onLayersPaneScroll: function(evt) {
    if (!this.hasScrolled) {
      this.hasScrolled = true;
      this.initialScrollPoint = evt.currentTarget.scrollTop;
    } else if (Math.abs(this.initialScrollPoint - evt.currentTarget.scrollTop) > INFO_WINDOW_SCROLL_HIDE_THRESHOLD) {
      this.layerInfoWindowView && this.layerInfoWindowView.hide();
    }
  },

  render: function() {
    var self = this,
      data = _.extend(
        {
          basemaps: this.options.config.basemaps,
          groupings: this.options.config.groupings,
        },
        Shareabouts.stickyFieldValues,
      );

    this.$el.html(Handlebars.templates["gis-legend-content"](data));

    _.each(this.options.config.groupings, function(group) {
      _.each(group.layers, function(layer) {
        if (layer.constituentLayers) {
          layer.constituentLayers.forEach(function(id) {
            $(Shareabouts).trigger("visibility", [id, !!layer.visibleDefault]);
          });
        } else {
          $(Shareabouts).trigger("visibility", [
            layer.id,
            !!layer.visibleDefault,
          ]);
        }
      });
    });

    var initialBasemap = _.find(this.options.config.basemaps, function(
      basemap,
    ) {
      return !!basemap.visibleDefault;
    });

    $(Shareabouts).trigger("visibility", [
      initialBasemap.id,
      !!initialBasemap.visibleDefault,
      true,
    ]);

    return this;
  },

  // Checkbox change handler, triggers event to the MapView
  toggleVisibility: function(evt) {
    var $cbox = $(evt.target),
      id = $cbox.attr("data-layerid"),
      constituentLayers = $cbox.attr("data-constituent-layers"),
      isChecked = !!$cbox.is(":checked");

    if (constituentLayers) {
      constituentLayers = constituentLayers.trim().split(" ");
      constituentLayers.forEach(function(id) {
        $(Shareabouts).trigger("visibility", [id, isChecked]);
      });
    } else {
      $(Shareabouts).trigger("visibility", [id, isChecked]);
    }
  },

  toggleBasemap: function(evt) {
    var radio = $(evt.target),
      id = radio.attr("data-layerid"),
      isChecked = !!radio.is(":checked"),
      basemaps = this.options.config.basemaps;

    $(Shareabouts).trigger("visibility", [id, isChecked, true]);
  },

  // Toggles visibility of layers based on header checkbox
  toggleHeaderVisibility: function(evt) {
    var $groupbox = $(evt.target),
      groupid = $groupbox.attr("id"),
      isChecked = $groupbox.is(":checked"),
      group = _.find(this.options.config.groupings, function(group) {
        return group.id === groupid;
      });

    for (var i = 0; i < group.layers.length; i++) {
      var layer = group.layers[i];
      $(Shareabouts).trigger("visibility", [layer.id, isChecked]);
      $("#map-" + layer.id).prop("checked", isChecked);
    }
  },

  onClickInfoIcon: function(evt) {
    let $currentTarget = $(evt.currentTarget);
    this.hasScrolled = false;

    if (!this.layerInfoWindowView) {
      this.layerInfoWindowView = new LayerInfoWindowView({
        el: "#layer-info-window-container",
        sidebar: this.options.sidebar
      });
    }

    this.layerInfoWindowView.setState({
      title: $currentTarget.data("info-title"),
      body: $currentTarget.data("info-content"),
      left: $currentTarget.parent().offset().left + evt.currentTarget.offsetLeft + INFO_WINDOW_LEFT_OFFSET_ADJUST,
      top: $currentTarget.parent().offset().top + evt.currentTarget.offsetTop + INFO_WINDOW_TOP_OFFSET_ADJUST,
      lastActiveInfoWindowId: $currentTarget.data("layerid")
    });
  }
});
