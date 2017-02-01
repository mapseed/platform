var Shareabouts = Shareabouts || {};

(function(S, $, console){
S.LegendView = Backbone.View.extend({

  render: function() {
    var self = this,
        data = _.extend({
          items: this.options.config.items
        }, S.stickyFieldValues);

    this.$el.html(Handlebars.templates['legend'](data));

    return this;
  }
});
})(Shareabouts, jQuery, Shareabouts.Util.console);
