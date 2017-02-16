/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.SidebarView = Backbone.View.extend({
    initialize: function() {
      var self = this;

    },

    render: function() {
      // build a config object without the legend box, so
      // it will not render in the leaflet sidebar
      var configNoLegend = {} 
      _.extend(configNoLegend, this.options.sidebarConfig);
      configNoLegend.panels = _.filter(configNoLegend.panels, function(panel) {
        return panel.id !== "right-sidebar";
      });

      var self = this,
          data = {
            config: configNoLegend
          };

      this.$el.html(Handlebars.templates['sidebar'](data));

      _.each(this.options.sidebarConfig.panels, function(panelConfig) {
        // TODO: Generalize this for views rendered outside of the sidebar:
        // (or for views with more complicated dependencies like ActivityView)
        if (panelConfig.id != 'ticker') {
          (new S[panelConfig.view]({
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
}(Shareabouts, jQuery, Shareabouts.Util.console));
