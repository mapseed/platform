const SidebarView = require("../../../../../base/static/js/views/sidebar-view.js");
import emitter from "../../../../../base/static/utils/emitter";

module.exports = SidebarView.extend({
  initialize: function() {
    var self = this;

    // BEGIN CUSTOM CODE
    emitter.addListener("nav-layer-btn:open", () => {
      self.sidebar.open("gis-layers-pane");
    });
    // END CUSTOM CODE
  },
});
