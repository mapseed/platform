var LegendView = require('../../../../../base/static/js/views/legend-view.js');

module.exports = LegendView.extend({
  render: function() {
    var self = this,
        data = _.extend({
          items: this.options.config.items
        }, Shareabouts.stickyFieldValues);

     console.log("RENDAH!!!!", this.$el);

    // use prepend here so as to not overwrite activity stream
    this.$el.prepend(Handlebars.templates['legend'](data));

    return this;
  }
});
