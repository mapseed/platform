/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.SidebarView = Backbone.View.extend({
    initialize: function() {
      var self = this;

      this.mapView = this.options.mapView;
      this.sidebarConfig = this.options.sidebarConfig;
    },

    render: function() {
      var self = this,
          data = {
            config: this.sidebarConfig
          };

      this.$el.html(Handlebars.templates['sidebar'](data));

      this.legendView = new S.LegendView({
        el: '#master-legend',
        mapView: this.mapView,
        items: this.sidebarConfig.panels.legend.items
      });

      this.gisLegendView = new S.GISLegendView({
        el: '#gis-legend',
        mapView: this.mapView,
        groupings: this.sidebarConfig.panels.gis_layers.groupings
      });

      this.legendView.render();
      this.gisLegendView.render();

      self.sidebar = L.control.sidebar('sidebar', {
        position: 'left'
      });
      self.sidebar.addTo(this.mapView);
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
