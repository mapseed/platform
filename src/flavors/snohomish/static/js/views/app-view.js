import AppView from "../../../../../base/static/js/views/app-view.js";
const Util = require("../../../../../base/static/js/utils.js");
// BEGIN CUSTOM CODE
import emitter from "../../../../../base/static/utils/emitter";
// END CUSTOM CODE

export default AppView.extend({
  events: {
    "click #add-place": "onClickAddPlaceBtn",
    "click .close-btn": "onClickClosePanelBtn",
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
