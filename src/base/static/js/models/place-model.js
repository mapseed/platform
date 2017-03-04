var SubmissionCollection = require('./submission-collection.js');
var AttachmentCollection = require('./attachment-collection.js');

var ModelUtils = require('./model-utils.js');

module.exports = Backbone.Model.extend({
  defaults: {
    type: "place"
  },
  initialize: function() {
    var attachmentData;

    this.submissionSets = {};

    _.each(this.get('submission_sets'), function(submissions, name) {
      var models = [];

      // It's a summary if it's not an array of objects
      if (_.isArray(submissions)) {
        models = submissions;
      }

      this.submissionSets[name] = new SubmissionCollection(models, {
        submissionType: name,
        placeModel: this
      });
    }, this);

    attachmentData = this.get('attachments') || [];
    this.attachmentCollection = new AttachmentCollection(attachmentData, {
      thingModel: this
    });

    this.attachmentCollection.each(function(attachment) {
      attachment.set({saved: true});
    });
  },

  set: function(key, val, options) {
    var args = ModelUtils.normalizeModelArguments(key, val, options);

    if (_.isArray(args.attrs.attachments) && this.attachmentCollection && !args.options.ignoreAttachments) {
      this.attachmentCollection.reset(args.attrs.attachments);
    }

    _.each(args.attrs.submission_sets, function(submissions, name) {
      // It's a summary if it's not an array of objects
      if (this.submissionSets && this.submissionSets[name] && _.isArray(submissions)) {
        this.submissionSets[name].reset(submissions);
      }
    }, this);

    return module.exports.__super__.set.call(this, args.attrs, args.options);
  },

  save: function(key, val, options) {
    // Overriding save so that we can handle adding attachments
    var self = this,
        realSuccessHandler,
        args = ModelUtils.normalizeModelArguments(key, val, options),
        attrs = args.attrs;
    options = args.options;

    // If this is a new model, then we need to save it first before we can
    // attach anything to it.
    if (this.isNew()) {
      realSuccessHandler = options.success || $.noop;

      // Attach files after the model is succesfully saved
      options.success = function() {
        self.saveAttachments();
        realSuccessHandler.apply(this, arguments);
      };
    } else {
      // Model is already saved, attach away!
      self.saveAttachments();
    }

    options.ignoreAttachments = true;
    module.exports.__super__.save.call(this, attrs, options);
  },

  saveAttachments: function() {
    this.attachmentCollection.each(function(attachment) {
      if (attachment.isNew()) {
        attachment.save();
      }
    });
  },

  parse: function(response) {
    var properties = _.clone(response.properties);
    // add story object, if relevant
    _.extend(properties, ModelUtils.addStoryObj(response, "place"));
    properties.geometry = _.clone(response.geometry);

    return properties;
  },

  sync: function(method, model, options) {
    var attrs;

    if (method === 'create' || method === 'update') {
      attrs = {
        'type': 'Feature',
        'geometry': model.get('geometry'),
        'properties': _.omit(model.toJSON(), 'geometry')
      };

      options.data = JSON.stringify(attrs);
      options.contentType = 'application/json';
    }

    return Backbone.sync(method, model, options);
  }
});
