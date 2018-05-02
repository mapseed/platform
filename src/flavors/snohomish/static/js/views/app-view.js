const AppView = require("../../../../../base/static/js/views/app-view.js");
const Util = require("../../../../../base/static/js/utils.js");

module.exports = AppView.extend({
  viewPage: function(slug) {
    var pageConfig = Util.findPageConfig(this.options.pagesConfig, {
        slug: slug,
      }),
      pageTemplateName = pageConfig.name || pageConfig.slug,
      pageHtml = Handlebars.templates[pageTemplateName]({
        config: this.options.config,
        // BEGIN CUSTOM CODE
        apiRoot: this.options.apiRoot,
        // END CUSTOM CODE
      });

    this.$panel.removeClass().addClass("page page-" + slug);
    this.showPanel(pageHtml);
    this.hideNewPin();
    this.destroyNewModels();
    this.hideCenterPoint();
    this.setBodyClass("content-visible", "content-expanded");
  },
});
