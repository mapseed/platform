var LayerInfoWindowView = require("./layer-info-window-view.js");
const INFO_WINDOW_LEFT_OFFSET_ADJUST = 30;
const INFO_WINDOW_TOP_OFFSET_ADJUST = -67;

module.exports = Backbone.View.extend({
  events: {
    "change .map-legend-basemap-radio": "toggleBasemap",
    "change .map-legend-checkbox": "toggleVisibility",
    "change .map-legend-grouping-checkbox": "toggleHeaderVisibility",
    "click .info-icon": "onClickInfoIcon"
  },

  initialize: function() {
    this.position = this.options.position || "left";

    $(Shareabouts).on("visibility", (evt, id, visible, isBasemap, swipePosition = "left") => {
      let uniqueId = this.options.uniqueId || "";

      if (swipePosition !== this.position) {
        $("#map-" + id + uniqueId)
          .prop("disabled", visible);

        if (isBasemap) {
          $("input[name='basemap" + uniqueId + "']")
            .not("#map-" + id + uniqueId)
            .prop("disabled", false);
        }
      }
    });

    if (!this.options.uniqueId) {

      // Only set up initial visibility for the main layers panel; in layer swipe
      // mode, we don't want the righthand side layer panel to reflect initial
      // visibility settings.
      _.each(this.options.config.groupings, function(group) {
        _.each(group.layers, function(layer) {
          if (layer.constituentLayers) {  
            layer.constituentLayers.forEach(function(id) {
              $(Shareabouts).trigger("visibility", [
                id, 
                !!layer.visibleDefault, 
                false, 
                this.position
              ]);
            });
          } else {
            $(Shareabouts).trigger("visibility", [
              layer.id,
              !!layer.visibleDefault,
              false,
              this.position
            ]);
          }
        }, this);
      }, this);

      var initialBasemap = _.find(this.options.config.basemaps, function(
        basemap,
      ) {
        return !!basemap.visibleDefault;
      });

      $(Shareabouts).trigger("visibility", [
        initialBasemap.id,
        !!initialBasemap.visibleDefault,
        true,
        this.position
      ]);
    }
  },

  render: function() {
    var self = this,
      data = _.extend(
        {
          basemaps: this.options.config.basemaps,
          groupings: this.options.config.groupings,

          // NOTE: uniqueId distinguishes righthand side layer panel input 
          // controls from the lefthand side controls
          uniqueId: this.options.uniqueId
        },
        Shareabouts.stickyFieldValues,
      );

    this.$el.html(Handlebars.templates["gis-legend-content"](data));

    if (this.options.uniqueId) {

      // If this layer panel appears on the right side of the layer swipe feature,
      // disable options for layers that are already visible on the left side of
      // the swipe.
      $("#gis-layers input").each(function() {
        if ($(this).prop("checked")) {
          $("#" + $(this).prop("id") + self.options.uniqueId).prop("disabled", true);
        }
      });

      $("#map-" + this.options.rightBasemapId + this.options.uniqueId).prop("checked", true);
    }

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
        $(Shareabouts).trigger("visibility", [id, isChecked, false, this.position]);
      });
    } else {
      $(Shareabouts).trigger("visibility", [id, isChecked, false, this.position]);
    }
  },

  toggleBasemap: function(evt) {
    var radio = $(evt.target),
      id = radio.attr("data-layerid"),
      isChecked = !!radio.is(":checked");

    $(Shareabouts).trigger("visibility", [id, isChecked, true, this.position]);
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
      top: $currentTarget.parent().offset().top + evt.currentTarget.offsetTop + INFO_WINDOW_TOP_OFFSET_ADJUST
    });
  }
});
