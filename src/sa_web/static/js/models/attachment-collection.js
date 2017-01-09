var AttachmentModel = require('./attachment-model.js');

module.exports = Backbone.Collection.extend({
  model: AttachmentModel,

  initialize: function(models, options) {
    this.options = options;
  },

  url: function() {
    var thingModel = this.options.thingModel,
        thingUrl = thingModel.url();

    return thingUrl + '/attachments';
  }
});
