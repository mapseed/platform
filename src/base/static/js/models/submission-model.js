module.exports = Backbone.Model.extend({
  sync: function(method, model, options) {
    if (method === "update" && model.get("submitter")) {
      // NOTE(jalmogo): If we are updating the place model and there
      // is a submitter, we should omit the submitter from the payload so
      // that the api knows to keep using the same reference. Otherwise,
      // the api thinks we are posting a brand new submitter.
      // Ideally, the api shouldn't allow for
      // creating new submitters when creating/updating a Place.
      // And we should be referencing the submitter by url
      // on the Place, and storing a collection of Submitters,
      // instead of hanging a submitter object off of the Place.
      model.unset("submitter");
      if (method === "update") {
        // If we are updating a place, make it a silent update to
        // avoid adding new actions to the Activity Stream.
        options.headers = Object.assign(options.headers || {}, {
          ["X-Shareabouts-Silent"]: true,
        });
      }
    }

    return Backbone.sync(method, model, options);
  },
});
