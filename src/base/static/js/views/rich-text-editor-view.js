var Util = require('../utils.js');

// a view for converting target textareas to rich text editor boxes
module.exports = Backbone.View.extend({
  events: {
    'change input[type="file"]': 'onQuillInputFileChange'

  },
  initialize: function() {
    var self = this,

    // Quill toolbar configuration
    toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      [{ "list": "ordered" }, { "list": "bullet" }],
      [{ "header": [1, 2, 3, 4, 5, 6, false] }],
      [{ "color": [] }, { "background": [] }],
      ["link", "image", "video"]
    ];
    
    this.quill = new Quill(this.el, {
      modules: { 
        "toolbar": toolbarOptions
      },
      theme: "snow",
      bounds: "#content"
    });
    this.toolbar = this.quill.getModule("toolbar"),
    
    onEditorChange = function() {
      this.quill.off("text-change", onEditorChange);
      this.options.placeDetailView.onModified();
    };

    $(this.quill.root).data("fieldName", this.options.fieldName);

    // override default image upload behavior; instead, trigger a save to our
    // S3 bucket and embed and img tag with the resulting src.
    this.toolbar.addHandler("image", function() {
      $("#" + self.options.fieldId)
        .remove("input[type='file']")
        .append("<input class='is-hidden' type='file' accept='image/png, image/gif, image/jpeg' />");

      self.delegateEvents();

      $("#" + self.options.fieldId + " input[type='file']").trigger("click");
    });

    // detect changes made via Quill
    this.quill.on("text-change", onEditorChange, this);
  },

  onAddAttachment: function(attachment) {
    var self = this;

    attachment.save(null, {
      success: function(obj) {
        self.quill.insertEmbed(self.quill.getSelection().index, "image", obj.file, "user");
      }
    });
  },

  onQuillInputFileChange: function(evt) {
    var self = this,
        file,
        attachment;

    if (evt.target.files && evt.target.files.length) {
      file = evt.target.files[0];

      Util.fileToCanvas(file, function(canvas) {
        canvas.toBlob(function(blob) {

          var fieldName = Math.random().toString(36).substring(7),
          data = {
            name: fieldName,
            blob: blob,
            file: canvas.toDataURL('image/jpeg')
          }

          self.options.placeDetailView.onAddAttachmentCallback = self.onAddAttachment;
          self.options.placeDetailView.onAddAttachmentCallbackContext = self;
          self.model.attachmentCollection.add(data);
        }, 'image/jpeg');
      }, {
        // TODO: make configurable
        maxWidth: 800,
        maxHeight: 800,
        canvas: true
      });
    }
  }
});