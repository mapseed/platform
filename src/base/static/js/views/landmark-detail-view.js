var PlaceDetailView = require("mapseed-place-detail-view");
var LandmarkSurveyView = require("mapseed-landmark-survey-view");

module.exports = PlaceDetailView.extend({
  initialize: function() {
    var self = this;
    this.description = this.options.description;
    this.originalDescription = this.options.originalDescription;
    this.model = this.options.model;

    this.landmarkSurveyView = new LandmarkSurveyView({});
  },

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
      this.model.attributes.story ? this.description : this.originalDescription,
    );
    // Render the view as-is (collection may have content already)
    this.$(".survey").html(this.landmarkSurveyView.render().$el);

    // add the story navigation bar again, at the bottom of the view
    this.$el.append(
      Handlebars.templates["place-detail-story-bar-tagline"](data),
    );

    this.delegateEvents();

    $("#content article").animate({ scrollTop: 0 }, "fast");

    return this;
  },
});
