// Legend: needs reports, not layers
var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LegendView = Backbone.View.extend({
    
    initialize: function () {
      var self = this;
      this.render();
      self.sidebar = L.control.sidebar('sidebar', {
        position: 'left'
      });
      self.sidebar.addTo(this.options.mapView.map);
    },

    render: function() {
      var self = this,
          data = _.extend({
            reports: this.options.reports,
            layers: this.options.layers
          }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['legend'](data));

      return this;
    },
  });
})(Shareabouts, jQuery, Shareabouts.Util.console);
