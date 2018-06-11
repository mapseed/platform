const LegendView = require("../../../../../base/static/js/views/legend-view.js");

module.exports = LegendView.extend({
  render: function() {
    this.$el.html(Handlebars.templates["legend"]());
    return this;
  },
});
