var ModelUtils = require("./model-utils.js");
var Util = require("../utils.js");

// This does not support editing at this time, which is why it is not a
// ShareaboutsModel
module.exports = Backbone.Model.extend({
  idAttribute: "name",

  initialize: function(attributes, options) {
    this.options = options;
  },

  isNew: function() {
    return this.get("saved") !== true;
  },

  // TODO: We should be overriding sync instead of save here. The only
  // override for save should be to always use wait=True.
  save: function(key, val, options) {
    // Overriding save so that we can handle adding attachments
    var args = ModelUtils.normalizeModelArguments(key, val, options),
      attrs = _.extend(this.attributes, args.attrs);

    return this._attachBlob(attrs.blob, attrs.name, args.options);
  },

  _attachBlob: function(blob, name, options) {
    var formData = new FormData(),
      self = this,
      progressHandler = Util.wrapHandler("progress", this, options.progress),
      myXhr = $.ajaxSettings.xhr();

    formData.append("file", blob);
    formData.append("name", name);

    options = options || {};

    $.ajax({
      url: this.collection.url(),
      type: "POST",
      xhr: function() {
        // custom xhr
        if (myXhr.upload) {
          // check if upload property exists
          myXhr.upload.addEventListener("progress", progressHandler, false); // for handling the progress of the upload
        }
        return myXhr;
      },
      //Ajax events
      success: function(attachmentResponse) {
        var args = Array.prototype.slice.call(arguments);

        // Set the save attribute on the incoming data so that we know it's
        // not new.
        args[0].saved = true;
        self.set({ saved: true });

        if (options.success) {
          options.success.apply(this, args);
        }
      },
      error: options.error,
      // Form data
      data: formData,
      //Options to tell JQuery not to process data or worry about content-type
      cache: false,
      contentType: false,
      processData: false,
    });
  },
});
