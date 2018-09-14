import AppView from "../../../../../base/static/js/views/app-view.js";
const Util = require("../../../../../base/static/js/utils.js");
// BEGIN CUSTOM CODE
import emitter from "../../../../../base/static/utils/emitter";
// END CUSTOM CODE

export default AppView.extend({
  events: {
    "click #add-place": "onClickAddPlaceBtn",
    "click .close-btn": "onClickClosePanelBtn",
    "click .right-sidebar__collapse-btn": "onToggleSidebarVisibility",
    "click .list-toggle-btn": "toggleListView",
    // BEGIN CUSTOM CODE
    "click .show-layer-panel": "showLayerPanel",
    // END CUSTOM CODE
  },

  // BEGIN CUSTOM CODE
  showLayerPanel: () => {
    emitter.emit("nav-layer-btn:toggle");
  },
  // END CUSTOM CODE

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
    this.setBodyClass("content-visible");
  },

  onClickAddPlaceBtn: function(evt) {
    evt.preventDefault();
    Util.log("USER", "map", "new-place-btn-click");
    // BEGIN CUSTOM CODE
    // NOTE: We use an internal rel in the anchor tag to do custom routing on
    // this flavor.
    //this.options.router.navigate("/new", { trigger: true });
    // END CUSTOM CODE
  },
});
