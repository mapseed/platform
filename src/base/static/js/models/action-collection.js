var PaginatedCollection = require("./paginated-collection.js");

module.exports = PaginatedCollection.extend({
  url: "/api/actions",
  comparator: function(a, b) {
    if (a.get("created_datetime") > b.get("created_datetime")) {
      return -1;
    } else {
      return 1;
    }
  },
});
