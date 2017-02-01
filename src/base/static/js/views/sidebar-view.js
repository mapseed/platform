  var views = {
    ActivityView: require('./activity-view.js'),
    AppView: require('./app-view.js'),
    AuthNavView: require('./auth-nav-view.js'),
    BasicLayerView: require('./basic-layer-view.js'),
    GeocodeAddressPlaceView: require('./geocode-address-place-view.js'),
    GeocodeAddressView: require('./geocode-address-view.js'),
    GISLegendView: require('./gis-legend-view.js'),
    LandmarkDetailView: require('./landmark-detail-view.js'),
    LandmarkSurveyView: require('./landmark-survey-view.js'),
    LayerView: require('./layer-view.js'),
    LegendView: require('./legend-view.js'),
    MapView: require('./map-view.js'),
    PagesNavView: require('./pages-nav-view.js'),
    PlaceCounterView: require('./place-counter-view.js'),
    PlaceDetailView: require('./place-detail-view.js'),
    PlaceFormView: require('./place-form-view.js'),
    PlaceListView: require('./place-list-view.js'),
    SupportView: require('./support-view.js'),
    SurveyView: require('./survey-view.js')
  };

  module.exports = Backbone.View.extend({
    initialize: function() {
      var self = this;

    },

    render: function() {
      var self = this,
          data = {
            config: this.options.sidebarConfig
          };

      this.$el.html(Handlebars.templates['sidebar'](data));

      _.each(this.options.sidebarConfig.panels, function(panelConfig) {
        // TODO: Generalize this for views rendered outside of the sidebar:
        // (or for views with more complicated dependencies like ActivityView)
        if (panelConfig.id != 'ticker') {
          (new views[panelConfig.view]({
            el: '#' + panelConfig.id,
            mapView: self.options.mapView,
            config: panelConfig
          })).render();
        }
      });

      self.sidebar = L.control.sidebar('sidebar', {
        position: 'left'
      });
      self.sidebar.addTo(this.options.mapView);
    }

  });
