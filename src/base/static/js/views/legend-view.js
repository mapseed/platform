module.exports = Backbone.View.extend({
  render: function() {
    var self = this,
      data = _.extend(
        {
          items: this.options.config.items,
        },
        Shareabouts.stickyFieldValues,
      );

    this.$el.html(Handlebars.templates["legend"](data));

    return this;
  },
});
