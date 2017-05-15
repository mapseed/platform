var Util = require('../utils.js');
var QuillResize = require('../../libs/quill-image-resize.js');

// a view for converting target textareas to rich text editor boxes
module.exports = Backbone.View.extend({
  events: {
    'change .quill-file-input': 'onQuillInputFileChange'
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

    Quill.register("modules/imageResize", QuillResize);

    this.quill = new Quill(this.el, {
      modules: { 
        "toolbar": toolbarOptions,
        imageResize: {
          handleStyles: {
            zIndex: "100"
          }
        }
      },
      theme: "snow",
      bounds: "#content"
    });
    this.toolbar = this.quill.getModule("toolbar");
    
    var onEditorChange = function() {
      this.quill.off("text-change", onEditorChange);
      if (this.options.placeDetailView) {
        this.options.placeDetailView.onModified();
      }
    };

    $(this.quill.root).data("fieldName", this.options.fieldName);

    // Override default image upload behavior; instead, trigger a save to our
    // S3 bucket and embed and img tag with the resulting src.
    this.toolbar.addHandler("image", function() {
      $("#" + self.options.fieldId)
        .remove("input[type='file']")
        .append("<input class='is-hidden quill-file-input' type='file' accept='image/png, image/gif, image/jpeg' />");

      self.delegateEvents();

      $("#" + self.options.fieldId + " input[type='file']").trigger("click");
    });

    // Detect changes made via Quill
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

          if (self.options.placeDetailView) {

            // If we have a place detail view, we already have a model to which
            // we can add attachments
            self.options.placeDetailView.onAddAttachmentCallback = self.onAddAttachment;
            self.options.placeDetailView.onAddAttachmentCallbackContext = self;
            self.model.attachmentCollection.add(data);
          } else if (self.options.placeFormView) {

            // Otherwise, store up the added attachments in the place form view
            self.options.placeFormView.formState.attachmentData.push(data);
            self.quill.insertEmbed(self.quill.getSelection().index, "image", data.file, "user");
          }

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