var LandmarkDetailView = require("../../../../../base/static/js/views/landmark-detail-view.js");

module.exports = LandmarkDetailView.extend({
  render: function() {
    var self = this,
      data = {
        description: this.description,
        story: this.model.attributes.story,
        title: this.model.attributes.title,
        fullTitle: this.model.attributes.fullTitle,
      };

    // add the story navigation bar
    this.$el.html(Handlebars.templates["place-detail-story-bar"](data));
    this.$el.append(
      "<div class='landmark-detail-content'>" +
      // BEGIN FLAVOR-SPECIFIC CODE
      // Overwriting here to handle the custom "original-title" field, since the
      // landmark serverless endpoint converts the "title" field to url-friendly
      // format
      "<h1 class='soundkeeper-landmark-title'>" + this.model.get("properties")["original-title"] + "</h1>" +
      // END FLAVOR-SPECIFIC CODE
      (this.model.attributes.story ? this.description : this.originalDescription) +
      "</div>"
    );
    // Render the view as-is (collection may have content already)
    this.$(".survey").html(this.landmarkSurveyView.render().$el);

    this.delegateEvents();

    $("#content article").animate({ scrollTop: 0 }, "fast");

    return this;
  }
});
