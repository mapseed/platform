var Shareabouts = Shareabouts || {};

// a view for converting target textareas to rich text editor boxes
(function(S, $, Quill, console) {
  S.RichTextEditorView = Backbone.View.extend({
    events: {

    },
    defaults: {

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
      ],
      quill = new Quill(this.options.target, {
        modules: { 
          "toolbar": toolbarOptions
        },
        theme: "snow",
        bounds: "#content"
      }),
      toolbar = quill.getModule("toolbar"),
      
      onEditorChange = function() {
        quill.off("text-change", onEditorChange);
        $(self.options.watchFields).off("keyup change");
        self.options.onModified();
      };

      $(quill.root).data("fieldName", this.options.fieldName);

      // override default image upload behavior: instead, create an <img>
      // tag with highlighted text set as the src attribute
      toolbar.addHandler("image", function() {
        var range = quill.getSelection();
        quill.insertEmbed(range.index, "image", quill.getText(range.index, range.length), "user");
      });

      // detect changes made via Quill
      quill.on("text-change", onEditorChange);

      // detect changes made to non-Quill form elements
      $(this.options.watchFields).on("keyup change", function(e) {
        if (e.type === "change") {
          onEditorChange();
        } else if ((e.keyCode >= 48 && e.keyCode <= 57) || // 0-9 (also shift symbols)
            (e.keyCode >= 65 && e.keyCode <= 90) || // a-z (also capital letters)
            (e.keyCode === 8) || // backspace key
            (e.keyCode === 46) || // delete key
            (e.keyCode === 32) || // spacebar
            (e.keyCode >= 186 && e.keyCode <= 222)) { // punctuation
          onEditorChange();
        }
      });
    }
  });

}(Shareabouts, jQuery, Quill, Shareabouts.Util.console));