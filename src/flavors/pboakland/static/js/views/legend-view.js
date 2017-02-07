  module.exports = Backbone.View.extend({
    render: function() {
      var self = this,
          data = _.extend({
            items: this.options.config.items
          }, Shareabouts.stickyFieldValues);

      // use prepend here so as to not overwrite activity stream
      this.$el.prepend(Handlebars.templates['legend'](data));

      return this;
    }
  });
