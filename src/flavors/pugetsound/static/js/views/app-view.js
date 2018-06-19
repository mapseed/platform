// BEGIN CUSTOM CODE
const AppView = require("../../../../../base/static/js/views/app-view.js");
import emitter from "../../../../../base/static/utils/emitter";
// END CUSTOM CODE

module.exports = AppView.extend({
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
});
