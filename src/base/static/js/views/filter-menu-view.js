/* A view for managing the location_type filter menu */

module.exports = Backbone.View.extend({
  events: {
    "change .filter-menu-item": "onFilterChange",
    "click #filter-menu-select-reset": "onFilterChange"
  },

  initialize () {
    let locationTypes = {},
        locationTypeModel = Backbone.Model.extend({
          defaults: {
            locationType: "",
            iconUrl: "",
            active: false,
            label: ""
          }
        });

    this.numActiveFilters = 0;
    this.state = new Backbone.Model({
      filters: new Backbone.Collection([])
    });

    this.getFilters().forEach((item) => {
      let model = new locationTypeModel({
        locationType: item.category,
        iconUrl: item.icon_url,
        label: item.label
      });
      model.on("change", this.onFilterStateChange, this);
      this.state.get("filters").add(model);
    }, this);

    this.render();
  },

  getFilters () {
    return (this.options.panelConfig.active_filters)
      ? this.options.panelConfig.active_filters
      : this.options.placeConfig.place_detail
  },

  onFilterChange (evt) {
    let locationType = evt.currentTarget.dataset.locationtype;

    if (locationType === "reset") {
      this.state.get("filters").each((model) => {
        model.set("active", false);
      });

      this.render();
    } else {
      let model = this.state
        .get("filters")
        .findWhere({locationType: locationType});

      model.set({
        active: !model.get("active")
      });
    }
  },

  onFilterStateChange (locationTypeModel) {
    let mapWasUnfiltered = (this.numActiveFilters === 0) ? true : false;
    this.numActiveFilters += (locationTypeModel.get("active")) ? 1 : -1;
    let mapWillBeUnfiltered = (this.numActiveFilters === 0) ? true : false;

    this.options.mapView.filter(locationTypeModel, mapWasUnfiltered, mapWillBeUnfiltered);
  },

  render () {
    let data = {
      activeFilters: this.state.get("filters").toJSON()
    };

    this.$el.html(Handlebars.templates["filter-menu"](data));
  }
});
