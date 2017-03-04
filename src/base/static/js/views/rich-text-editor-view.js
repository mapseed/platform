// a view for converting target textareas to rich text editor boxes
module.exports = Backbone.View.extend({
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
      self.options.placeDetailView.onModified();
    };

    $(quill.root).data("fieldName", this.options.fieldName);

    // override default image upload behavior: instead, create an <img>
    // tag with highlighted text set as the src attribute
    // toolbar.addHandler("image", function() {
    //   var range = quill.getSelection();
    //   quill.insertEmbed(range.index, "image", quill.getText(range.index, range.length), "user");
    // });

    // detect changes made via Quill
    quill.on("text-change", onEditorChange);
  }
});