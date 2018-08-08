var ModelUtils = require("./model-utils.js");
var Util = require("../utils.js");

// This does not support editing at this time, which is why it is not a
// ShareaboutsModel
module.exports = Backbone.Model.extend({
  idAttribute: "id",
  initialize: function(attributes, options) {
    this.options = options;
  },

  isNew: function() {
    return this.get("saved") !== true;
  },

  update: function(key, val, options) {
    var args = ModelUtils.normalizeModelArguments(key, val, options),
      attrs = _.extend(this.attributes, args.attrs);

    args.options.url = this.get("url");
    args.options.type = "PATCH";

    return this._attachBlob(
      attrs.blob,
      attrs.name,
      attrs.type,
      attrs.visible,
      args.options,
    );
  },

  // TODO: We should be overriding sync instead of save here. The only
  // override for save should be to always use wait=True.
  save: function(key, val, options) {
    // Overriding save so that we can handle adding attachments
    var args = ModelUtils.normalizeModelArguments(key, val, options),
      attrs = _.extend(this.attributes, args.attrs);

    args.options.url = this.collection.url();
    args.options.type = "POST";

    return this._attachBlob(
      attrs.blob,
      attrs.name,
      attrs.type,
      attrs.visible,
      args.options,
    );
  },

  _attachBlob: function(blob, name, type, visible = true, options) {
    var formData = new FormData(),
      self = this,
      progressHandler = Util.wrapHandler("progress", this, options.progress),
      myXhr = $.ajaxSettings.xhr();

    formData.append("file", blob);
    formData.append("name", name);
    formData.append("type", type);
    formData.append("visible", visible);

    options = options || {};

    $.ajax({
      url: options.url,
      type: options.type,
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

        self.set({
          saved: true,
          visible: attachmentResponse.visible,
          id: attachmentResponse.id,
          url: attachmentResponse.url,
        });

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
