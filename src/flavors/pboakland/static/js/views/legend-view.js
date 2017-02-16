var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LegendView = Backbone.View.extend({

    render: function() {
      var self = this,
          data = _.extend({
            items: this.options.config.items
          }, S.stickyFieldValues);

      // use prepend here so as to not overwrite activity stream
      this.$el.prepend(Handlebars.templates['legend'](data));

      return this;
    }
  });
})(Shareabouts, jQuery, Shareabouts.Util.console);
