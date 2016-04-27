/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.SidebarView = Backbone.View.extend({
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
