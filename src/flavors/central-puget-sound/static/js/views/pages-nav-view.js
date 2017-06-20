var PagesNavView = require("../../../../../base/static/js/views/pages-nav-view.js");

module.exports = PagesNavView.extend({

  render: function() {
    var navPageConfig = this.options.pagesConfig || [],

        // Begin flavor-specific code
        rightNavPageConfig = navPageConfig.filter(function(obj, i) {
          return obj["pull_right"] === true;
        });
        // End flavor-specific code

    navPageConfig = navPageConfig.filter(function(obj) {

      // Begin flavor-specific code
      return obj["hide_from_top_bar"] !== true && obj["pull_right"] !== true;
      // End flavor-specific code
    });

    var data = {
      pages: navPageConfig,
      has_pages: navPageConfig.length > 0,
      show_list_button_label: this.options.placeConfig.show_list_button_label,
      show_map_button_label: this.options.placeConfig.show_map_button_label,

      // Begin flavor-specific code
      add_button_label: this.options.placeConfig.add_button_label,
      pagesRight: rightNavPageConfig
      // End flavor-specific code
    },
      template = Handlebars.templates["pages-nav"](data);
    this.$el.html(template);

    return this;
  }

});
