/* A view for managing the location_type filter menu */

module.exports = Backbone.View.extend({
  events: {
    "click .filter-menu-item": "onFilterChange"
  },

  initialize () {
    let locationTypes = {},
        locationTypeModel = Backbone.Model.extend({
          defaults: {
            locationType: "",
            iconUrl: "",
            active: true,
            label: ""
          }
        });

    this.state = new Backbone.Model({
      allSelected: true,
      filters: new Backbone.Collection([])
    });

    // We initialize all filters to be set to false, so all location_types will
    // be displayed on the map on page load
    this.options.placeConfig.place_detail.forEach((item) => {
      let model = new locationTypeModel({
        locationType: item.category,
        iconUrl: item.icon_url,
        active: false,
        label: item.label
      });
      model.on("change", this.onFilterStateChange, this);
      this.state.get("filters").add(model);
    }, this);

    this.render();
  },

  onFilterChange (evt) {
    let locationType = evt.currentTarget.id.replace(/^filter-menu-select-/, "");

    if (locationType === "all") {
      this.state.set("allSelected", !this.state.get("allSelected"));
      this.state.get("filters").each((model) => {
        model.set("active", this.state.get("allSelected"));
      });

      this.render();
    } else {
      let model = this.state
        .get("filters")
        .findWhere({locationType: locationType});

      model.set({
        active: !model.get("active")
      });

      // if (!model.get("active")) {

      //   // Make sure to uncheck the "all" option if we've unchecked one of the
      //   // constituent elements
      //   this.state.set("allSelected", false);
      //   this.render();
      // }
    }
  },

  onFilterStateChange (locationTypeModel) {
    this.options.mapView.filter(locationTypeModel);
    this.render();
  },

  render () {
    let data = {
      filterAllLabel: this.options.filtersConfig.filter_all_label,
      activeFilters: this.state.get("filters").toJSON(),
      allSelected: this.state.get("allSelected")
    };

    this.$el.html(Handlebars.templates["filter-menu"](data));
  }
});
