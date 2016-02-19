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
            items: this.options.items
          }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['legend'](data));

      return this;
    },
  });
})(Shareabouts, jQuery, Shareabouts.Util.console);
