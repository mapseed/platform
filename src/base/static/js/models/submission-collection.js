var PaginatedCollection = require("./paginated-collection");

module.exports = PaginatedCollection.extend({
  initialize: function(models, options) {
    this.options = options;
  },

  url: function() {
    var submissionType = this.options.submissionType,
      placeId = this.options.placeModel && this.options.placeModel.id,
      datasetId =
        this.options.placeModel && this.options.placeModel.get("datasetId");

    if (!submissionType) {
      throw new Error("submissionType option" + " is required.");
    }

    if (!placeId) {
      throw new Error(
        "Place model id is not defined. You " +
          "must save the place before saving " +
          "its " +
          submissionType +
          ".",
      );
    }

    return (
      this.options.placeModel.collection.url + "/" + placeId + "/" + submissionType
    );
  },

  comparator: "created_datetime",
});
