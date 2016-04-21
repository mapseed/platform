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

      _.each(this.sidebarConfig.panels, function(panelConfig) {
        (new S[panelConfig.view]({
          el: '#' + panelConfig.id,
          mapView: this.mapView,
          config: panelConfig
        })).render();
      });

      self.sidebar = L.control.sidebar('sidebar', {
        position: 'left'
      });
      self.sidebar.addTo(this.mapView);
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
