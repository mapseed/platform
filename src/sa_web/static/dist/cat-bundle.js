/*global Handlebars _ moment */

var Shareabouts = Shareabouts || {};

(function(NS) {
  Handlebars.registerHelper('STATIC_URL', function() {
    return NS.bootstrapped.staticUrl;
  });

  Handlebars.registerHelper('debug', function(value) {
    if (typeof(value) === typeof({})) {
      return JSON.stringify(value, null, 4);
    } else {
      return value;
    }
  });

  Handlebars.registerHelper('current_url', function() {
    return window.location.toString();
  });

  Handlebars.registerHelper('permalink', function() {
    return window.location.toString();
  });

  Handlebars.registerHelper('is', function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('if_fileinput_not_supported', function(options) {    
    return !NS.Util.fileInputSupported() ? options.fn(this) : null;
  });

  Handlebars.registerHelper('if_not_authenticated', function(options) {
    return !(NS.bootstrapped && NS.bootstrapped.currentUser) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('property', function(a, b) {
    return a[b];
  });

  // Current user -------------------------------------------------------------

  Handlebars.registerHelper('is_authenticated', function(options) {
    return (NS.bootstrapped && NS.bootstrapped.currentUser) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('current_user', function(attr) {
    return (NS.bootstrapped.currentUser ? NS.bootstrapped.currentUser[attr] : undefined);
  });

  // Date and time ------------------------------------------------------------

  Handlebars.registerHelper('formatdatetime', function(datetime, format) {
    if (datetime) {
      return moment(datetime).format(format);
    }
    return datetime;
  });

  Handlebars.registerHelper('fromnow', function(datetime) {
    if (datetime) {
      return moment(datetime).fromNow();
    }
    return '';
  });

  // String -------------------------------------------------------------------

  Handlebars.registerHelper('truncatechars', function(text, maxLength, continuationString) {
    if (_.isUndefined(continuationString) || !_.isString(continuationString)) {
      continuationString = '...';
    }

    if (text && text.length > maxLength) {
      return text.slice(0, maxLength - continuationString.length) + continuationString;
    } else {
      return text;
    }
  });

  Handlebars.registerHelper('is_submitter_name', function(options) {
    return (this.name === 'submitter_name') ? options.fn(this) : options.inverse(this);
  });

  // Place Details ------------------------------------------------------------
  Handlebars.registerHelper('action_text', function() {
    return NS.Config.place.action_text || '';
  });

  Handlebars.registerHelper('place_type_label', function(typeName) {
    var placeType = NS.Config.placeTypes[typeName];
    return placeType ? (placeType.label || typeName) : '';
  });

  Handlebars.registerHelper('anonymous_name', function(typeName) {
    return NS.Config.place.anonymous_name;
  });

  Handlebars.registerHelper('survey_label_by_count', function() {
    var count = 0,
        submissionSet;

    if (this.submission_sets && this.submission_sets[NS.Config.survey.submission_type]) {
      submissionSet = this.submission_sets[NS.Config.survey.submission_type];
      count = submissionSet ? submissionSet.length : 0;
    }

    if (count === 1) {
      return NS.Config.survey.response_name;
    }
    return NS.Config.survey.response_plural_name;
  });

  Handlebars.registerHelper('survey_label', function() {
    return NS.Config.survey.response_name;
  });

  Handlebars.registerHelper('survey_label_plural', function() {
    return NS.Config.survey.response_plural_name;
  });

  Handlebars.registerHelper('support_label', function() {
    return NS.Config.support.response_name;
  });

  Handlebars.registerHelper('support_label_plural', function() {
    return NS.Config.support.response_plural_name;
  });


  Handlebars.registerHelper('survey_count', function() {
    var count = 0,
        submissionSet;

    if (this.submission_sets && this.submission_sets[NS.Config.survey.submission_type]) {
      submissionSet = this.submission_sets[NS.Config.survey.submission_type];
      count = submissionSet ? submissionSet.length : 0;
    }

    return count;
  });

  // Gets the value for the given object and key. Useful for using the value
  // of a token as a key.
  Handlebars.registerHelper('get_value', function(obj, key, options) {
    return obj[key];
  });

  // Similar to the helper in our shared handlebars helpers repo, but gets the
  // value via a given object and key (like get_value).
  Handlebars.registerHelper('select_item_value', function(obj, key, options) {
    var value = obj[key],
        $el = $('<div/>').html(options.fn(this)),
        selectValue = function(v) {
          $el.find('[value="'+v+'"]').attr({
            checked: 'checked',
            selected: 'selected'
          });
        };

    if ($.isArray(value)) {
      jQuery.each(value, function(i, v) {
        selectValue(v);
      });
    } else {
      selectValue(value);
    }

    return $el.html();
  });

  Handlebars.registerHelper("contains", function( value, array, options ){
    array = ( array instanceof Array ) ? array : [array];
    return (array.indexOf(value) > -1) ? options.fn( this ) : "";
  });

  Handlebars.registerHelper('each_place_item', function() {
    var self = this,
        result = '',
        args = Array.prototype.slice.call(arguments),
        exclusions, options,
        selectedCategoryConfig = _.find(NS.Config.place.place_detail, function(categoryConfig) { return categoryConfig.category === self.location_type; }) || {};

    options = args.slice(-1)[0];
    exclusions = args.slice(0, args.length-1);

    // iterate through all the form fields for this location_type
    _.each(selectedCategoryConfig.fields, function(item, i) {
      // handle input types on a case-by-case basis, building an appropriate
      // context object for each
      var userInput = self[item.name],
      fieldType = item.type,
      content, 
      wasAnswered = false;

      if (fieldType === "text" || fieldType === "textarea" || fieldType === "datetime") {
        // case: plain text
        content = userInput || "";
        if (content !== "") {
          wasAnswered = true;
        }
      } else if (fieldType === "checkbox_big_buttons" || fieldType === "radio_big_buttons" || fieldType === "dropdown") {
        // case: checkboxes, radio buttons, and dropdowns
        // if input is not an array, convert to an array of length 1
        if (!$.isArray(self[item.name])) {
          userInput = [self[item.name]];
        }
        content = [];
        _.each(item.content, function(option) {
          var selected = false;
          if (_.contains(userInput, option.value)) {
            selected = true;
            wasAnswered = true;
          }
          content.push({
            value: option.value,
            label: option.label,
            selected: selected
          });
        });
      } else if (fieldType === "binary_toggle") {
        // case: binary toggle buttons
        // NOTE: we assume that the first option listed under content
        // corresponds to the "on" value of the toggle input
        content = {
          selectedValue: item.content[0].value,
          selectedLabel: item.content[0].label,
          unselectedValue: item.content[1].value,
          unselectedLabel: item.content[1].label,
          selected: (userInput == item.content[0].value) ? true : false
        }
        wasAnswered = true;
      }

      var newItem = {
        name: item.name,
        type: item.type,
        content: content,
        prompt: item.display_prompt,
        wasAnswered: wasAnswered,
        isEditingToggled: this.isEditingToggled
      };

      if (_.contains(exclusions, item.name) === false &&
          item.name.indexOf('private-') !== 0 &&
            newItem.content != undefined && 
              newItem.wasAnswered === true) {
        result += options.fn(newItem);
      }
    }, this);

    return result;
  });

  Handlebars.registerHelper('place_url', function(place_id) {
    var l = window.location,
        protocol = l.protocol,
        host = l.host;

    return [protocol, '//', host, '/place/', place_id].join('');
  });

}(Shareabouts));

/*global _, Backbone, jQuery */

var Shareabouts = Shareabouts || {};

(function(S, $) {
  'use strict';

  var normalizeModelArguments = function(key, val, options) {
    var attrs;
    if (key === null || _.isObject(key)) {
      attrs = key;
      options = val;
    } else if (key !== null) {
      (attrs = {})[key] = val;
    }
    options = options ? _.clone(options) : {};

    return {
      options: options,
      attrs: attrs
    };
  };

  var addStoryObj = function(response, type) {
    var storyObj = null,
    url;
    if (type === "place") { url = response.properties.datasetSlug + "/" + response.properties.id; }
    else if (type === "landmark") { url = response.title; }
    _.each(S.Config.story, function(story) {
      if (story.order[url]) {
        storyObj = {
          tagline: story.tagline,
          next: story.order[url].next,
          previous: story.order[url].previous,
          zoom: story.order[url].zoom,
          panTo: story.order[url].panTo,
          visibleLayers: story.order[url].visibleLayers,
          basemap: story.order[url].basemap,
          spotlight: story.order[url].spotlight
        }
      }
    });
    return { story: storyObj }
  };

  // Pull out the full title string from the block of HTML used
  // to render the landmark
  var addLandmarkDescription = function(properties) {
    var fullTitle,
    re = /^\s*<(h[0-9]|b)>(.+)<(\/h[0-9]|\/b)>/,
    // Grab the full title from between header or bold tags at the beginning
    // of the HTML block
    match = properties.description.match(re);
    if (match) {
      // the second capture group represents the full title
      fullTitle = match[2];
      properties.originalDescription = properties.description;
      properties.description = properties.description.replace(re, "");
    } else {
      fullTitle = properties.title;
    }
    return { fullTitle: fullTitle }
  };

  S.PaginatedCollection = Backbone.Collection.extend({
    resultsAttr: 'results',

    parse: function(response, options) {
      if (options.attributesToAdd) {
        var self = this;
        for (var i=0; i<response[this.resultsAttr].length; i++)
          _.extend(response[this.resultsAttr][i][options.attribute], options.attributesToAdd);
      }
      this.metadata = response.metadata;
      return response[this.resultsAttr];
    },

    fetchNextPage: function(success, error) {
      var collection = this;

      if (this.metadata.next) {
        collection.fetch({
          remove: false,
          url: collection.metadata.next,
          success: success,
          error: error
        });
      }
    },

    fetchAllPages: function(options) {
      var self = this,
          onFirstPageSuccess, onPageComplete,
          onPageSuccess, onPageError,
          onAllSuccess, onAnyError,
          attemptedPages = 0, totalPages = 1;

      options = options || {};
      options.data = options.data || {};

      if (options.error) {
        onAnyError = _.once(options.error);
      }

      onFirstPageSuccess = function(obj, data) {
        // Calculate the total number of pages based on the size of the rist
        // page, assuming all pages except the last will be the same size.
        var pageSize = data[self.resultsAttr].length, i;
        totalPages = Math.ceil(data.metadata.length / pageSize);

        if (options.success) {
          onAllSuccess = _.after(totalPages, options.success);
        }

        // Fetch all the rest of the pages in parallel.
        if (data.metadata.next) {
          for (i = 2; i <= totalPages; i++) {
            self.fetch(_.defaults({
              remove: false,
              data: _.defaults({ page: i }, options.data),
              complete: onPageComplete,
              success: onPageSuccess,
              error: onPageError
            }, options));
          }
        }

        onPageSuccess.apply(this, arguments);
      };

      onPageComplete = function() {
        attemptedPages++;
        if (options.pageComplete) { options.pageComplete.apply(this, arguments); }
        if (attemptedPages === totalPages && options.complete) { options.complete.apply(this, arguments); }
      };

      onPageSuccess = function() {
        if (options.pageSuccess) { options.pageSuccess.apply(this, arguments); }
        if (onAllSuccess) { onAllSuccess.apply(this, arguments); }
      };

      onPageError = function() {
        if (options.pageError) { options.pageError.apply(this, arguments); }
        if (onAnyError) { onAnyError.apply(this, arguments); }
      };

      this.fetch(_.defaults({
        // Note that success gets called before complete, which is imprtant
        // because complete should know whether correct total number of pages.
        // However, if the request for the first page fails, complete will
        // assume one page.
        success: onFirstPageSuccess,
        error: onPageError,
        complete: onPageComplete
      }, options));
    }
  });

  S.SubmissionCollection = S.PaginatedCollection.extend({
    initialize: function(models, options) {
      this.options = options;
    },

    url: function() {
      var submissionType = this.options.submissionType,
          placeId = this.options.placeModel && this.options.placeModel.id,
          datasetId = this.options.placeModel && this.options.placeModel.get("datasetId");

      if (!submissionType) { throw new Error('submissionType option' +
                                                     ' is required.'); }

      if (!placeId) { throw new Error('Place model id is not defined. You ' +
                                      'must save the place before saving ' +
                                      'its ' + submissionType + '.'); }

      return '/dataset/' + datasetId + '/places/' + placeId + '/' + submissionType;
    },

    comparator: 'created_datetime'
  });

  S.PlaceModel = Backbone.Model.extend({
    initialize: function() {
      var attachmentData;

      this.submissionSets = {};

      _.each(this.get('submission_sets'), function(submissions, name) {
        var models = [];

        // It's a summary if it's not an array of objects
        if (_.isArray(submissions)) {
          models = submissions;
        }

        this.submissionSets[name] = new S.SubmissionCollection(models, {
          submissionType: name,
          placeModel: this
        });
      }, this);

      attachmentData = this.get('attachments') || [];
      this.attachmentCollection = new S.AttachmentCollection(attachmentData, {
        thingModel: this
      });

      this.attachmentCollection.each(function(attachment) {
        attachment.set({saved: true});
      });
    },

    set: function(key, val, options) {
      var args = normalizeModelArguments(key, val, options);

      if (_.isArray(args.attrs.attachments) && this.attachmentCollection && !args.options.ignoreAttachments) {
        this.attachmentCollection.reset(args.attrs.attachments);
      }

      _.each(args.attrs.submission_sets, function(submissions, name) {
        // It's a summary if it's not an array of objects
        if (this.submissionSets && this.submissionSets[name] && _.isArray(submissions)) {
          this.submissionSets[name].reset(submissions);
        }
      }, this);

      return S.PlaceModel.__super__.set.call(this, args.attrs, args.options);
    },

    save: function(key, val, options) {
      // Overriding save so that we can handle adding attachments
      var self = this,
          realSuccessHandler,
          args = normalizeModelArguments(key, val, options),
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
      S.PlaceModel.__super__.save.call(this, attrs, options);
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
      _.extend(properties, addStoryObj(response, "place"));
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

  S.PlaceCollection = S.PaginatedCollection.extend({
    url: '/api/places',
    model: S.PlaceModel,
    resultsAttr: 'features',

    fetchByIds: function(ids, options) {
      var base = _.result(this, 'url');

      if (ids.length === 1) {
        this.fetchById(ids[0], options);
      } else {
        ids = _.map(ids, function(id) { return encodeURIComponent(id); });
        options = options ? _.clone(options) : {};
        options.url = base + (base.charAt(base.length - 1) === '/' ? '' : '/') + ids.join(',');

        this.fetch(_.extend(
          {remove: false},
          options
        ));
      }
    },

    fetchById: function(id, options) {
      options = options ? _.clone(options) : {};
      var self = this,
          place = new S.PlaceModel(),
          success = options.success;

      place.id = id;
      place.collection = self;

      options.success = function() {
        var args = Array.prototype.slice.call(arguments);
        self.add(place);
        if (success) {
          success.apply(this, args);
        }
      };
      place.fetch(options);
    }
  });

  // This model is based off the Mapbox Classic API
  S.LandmarkModel = Backbone.Model.extend({
    initialize: function() {
      this.set("id", this.get('title'));
    },
    parse: function(response) {
      var response = _.clone(response);
      // add story object, if relevant
      _.extend(response, addStoryObj(response, "landmark"));
      _.extend(response, addLandmarkDescription(response.properties));

      return response;
    }
  });

  S.LandmarkCollection = Backbone.Collection.extend({
    model: S.LandmarkModel,

    // The MapBox GeoJson API returns places under "features".
    // TODO: refactor this by making landmark collection inherit
    // from PaginatedCollection
    parse: function(resp, options) {
      if (options.attributesToAdd) {
        for (var i = 0; i < resp.features.length; i++)
          _.extend(resp.features[i], options.attributesToAdd);
      }
      return resp.features;
    }
  });

  // This does not support editing at this time, which is why it is not a
  // ShareaboutsModel
  S.AttachmentModel = Backbone.Model.extend({
    idAttribute: 'name',

    initialize: function(attributes, options) {
      this.options = options;
    },

    isNew: function() {
      return this.get('saved') !== true;
    },

    // TODO: We should be overriding sync instead of save here. The only
    // override for save should be to always use wait=True.
    save: function(key, val, options) {
      // Overriding save so that we can handle adding attachments
      var args = normalizeModelArguments(key, val, options),
          attrs = _.extend(this.attributes, args.attrs);

      return this._attachBlob(attrs.blob, attrs.name, args.options);
    },

    _attachBlob: function(blob, name, options) {
      var formData = new FormData(),
          self = this,
          progressHandler = S.Util.wrapHandler('progress', this, options.progress),
          myXhr = $.ajaxSettings.xhr();

      formData.append('file', blob);
      formData.append('name', name);

      options = options || {};

      $.ajax({
        url: this.collection.url(),
        type: 'POST',
        xhr: function() {  // custom xhr
          if(myXhr.upload){ // check if upload property exists
            myXhr.upload.addEventListener('progress', progressHandler, false); // for handling the progress of the upload
          }
          return myXhr;
        },
        //Ajax events
        success: function() {
          var args = Array.prototype.slice.call(arguments);

          // Set the save attribute on the incoming data so that we know it's
          // not new.
          args[0].saved = true;
          self.set({saved: true});

          if (options.success) {
            options.success.apply(this, args);
          }

        },
        error: options.error,
        // Form data
        data: formData,
        //Options to tell JQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false
      });
    }
  });

  S.AttachmentCollection = Backbone.Collection.extend({
    model: S.AttachmentModel,

    initialize: function(models, options) {
      this.options = options;
    },

    url: function() {
      var thingModel = this.options.thingModel,
          thingUrl = thingModel.url();

      return thingUrl + '/attachments';
    }
  });

  S.ActionCollection = S.PaginatedCollection.extend({
    url: '/api/actions',
    comparator: function(a, b) {
      if (a.get('created_datetime') > b.get('created_datetime')) {
        return -1;
      } else {
        return 1;
      }
    }
  });

}(Shareabouts, jQuery));

/*global jQuery */

/*****************************************************************************

CSRF Validation
---------------
Django protects against Cross Site Request Forgeries (CSRF) by default. This
type of attack occurs when a malicious Web site contains a link, a form button
or some javascript that is intended to perform some action on your Web site,
using the credentials of a logged-in user who visits the malicious site in their
browser.

Since the API proxy view sends requests that write data to the Shareabouts
service authenticated as the owner of this dataset, we want to protect the API
view against CSRF. In order to ensure that AJAX POST/PUT/DELETE requests that
are made via jQuery will not be caught by the CSRF protection, we use the
following code. For more information, see:
https://docs.djangoproject.com/en/1.4/ref/contrib/csrf/

*/

jQuery(document).ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }

    // If this is a DELETE request, explicitly set the data to be sent so that
    // the browser will calculate a value for the Content-Length header.
    if (settings.type === 'DELETE') {
        xhr.setRequestHeader("Content-Type", "application/json");
        settings.data = '{}';
    }
});

/*globals jQuery _ Handlebars Backbone */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PagesNavView = Backbone.View.extend({
    events: {
      'click .internal-menu-item a': 'onPageLinkClick',
      'click #nav-btn': 'onMobileNavClick',
      'click #sign-in-btn': 'onAuthNavClick'
    },

    render: function() {
      var navPageConfig = this.options.pagesConfig || [];
      navPageConfig = navPageConfig.filter( function(obj) {
        return obj['hide_from_top_bar'] !== true;
      })
      var data = {
            pages: navPageConfig,
            has_pages: (navPageConfig.length > 0)
          },
          template = Handlebars.templates['pages-nav'](data);
      this.$el.html(template);

      return this;
    },

    onPageLinkClick: function(evt) {
      evt.preventDefault();
      // Hide mobile list when one is selected
      $('.access').removeClass('is-exposed');
      // Load the content
      this.options.router.navigate(evt.target.getAttribute('href'), {trigger: true});
      S.Util.log('USER', 'page-menu', 'click-link', evt.target.getAttribute('href') + " -- " + evt.target.textContent);
    },

    onMobileNavClick: function(evt) {
      evt.preventDefault();
      $('.access').toggleClass('is-exposed');
      S.Util.log('USER', 'page-menu', ($('.access').hasClass('is-exposed') ? 'show' : 'hide') + '-mobile-nav');
    },

    onAuthNavClick: function(evt) {
      evt.preventDefault();
      $('.sign-in-menu').toggleClass('is-exposed');
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals jQuery _ Handlebars Backbone */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.AuthNavView = Backbone.View.extend({
    events: {
      'click .internal-menu-item a': 'onLinkClick',
      'click #nav-btn': 'onMobileNavClick',
      'click #sign-in-btn': 'onAuthNavClick'
    },

    render: function() {
      var data = S.bootstrapped.currentUser,
          template = Handlebars.templates['auth-nav'](data);
      this.$el.html(template);

      return this;
    },

    onLinkClick: function(evt) {
      evt.preventDefault();
      // Hide mobile list when one is selected
      $('.access').removeClass('is-exposed');
      // Load the content
      this.options.router.navigate(evt.target.getAttribute('href'), {trigger: true});
    },

    onMobileNavClick: function(evt) {
      evt.preventDefault();
      $('.access').toggleClass('is-exposed');
    },

    onAuthNavClick: function(evt) {
      evt.preventDefault();
      $('.sign-in-menu').toggleClass('is-exposed');
      S.Util.log('USER', 'page-menu', ($('.sign-in-menu').hasClass('is-exposed') ? 'show' : 'hide') + '-auth');
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals jQuery _ Backbone Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.ActivityView = Backbone.View.extend({
    initialize: function() {
      var self = this;

      // Add class to the body to show the activity view
      $('body').addClass('activity-enabled');

      this.activityViews = [];

      this.activities = this.options.activities;
      this.places = this.options.places;

      // Store a separate collection of all activities 
      // merged together, useful for collecting models from 
      // different datasets to facilitate sorting
      this.mergedActivities = new S.ActionCollection([]);

      // Infinite scroll elements and functions
      // Window where the activity lives
      this.$container = this.$el.parent();
      // How often to check for new content
      this.interval = this.options.interval;
      // How many pixel from the bottom until we look for more/older actions
      this.infiniteScrollBuffer = this.options.infiniteScrollBuffer || 25;
      // Debounce the scroll handler for efficiency
      //this.debouncedOnScroll = _.debounce(this.onScroll, 600);

      // Bind click event to an action so that you can see it in a map
      this.$el.delegate('a', 'click', function(evt){
        evt.preventDefault();

        // HACK! Each action should have its own view and bind its own events.
        // A Marionette CompositeView/ItemView would be ideal. Until then...
        var actionType = this.getAttribute('data-action-type'),
            placeId = this.getAttribute('data-place-id');

        S.Util.log('USER', 'action', 'click', actionType+' -- '+placeId);
        self.options.router.navigate(this.getAttribute('href'), {trigger: true});
      });

      // Check to see if we're at the bottom of the list and then fetch more results.
      // NOTE: we've removed the scroll listener for the time being, as it wasn't in
      // use and has not been refactored for multiple datasets
      //this.$container.on('scroll', _.bind(this.debouncedOnScroll, this));

      // Bind collection events
      _.each(this.activities, function(collection) {
        collection.on('add', self.onAddAction, self);
        collection.on('reset', self.onResetActivity, self);
      });
    },

    checkForNewActivity: function() {
      var self = this,
      options = {
        remove: false,
        attribute: 'target'
      },
      meta = {};
      this.fetching = false;

      _.each(this.activities, function(collection, key) {
        meta[key] = collection.metadata;
      });

      // The metadata will be reset to page 1 if a new action has been added.
      // We need to cache the current page information so that when we will
      // fetch to correct page when we scroll to the next break.
      options.complete = _.bind(function() {
        // The total length may have changed, so don't overwrite it!
        _.each(self.activities, function(collection, key) {
          // NOTE: I think there is an async issue here, in which a dataset's activities
          // are not yet fetched but checkForNewActivity() is run. There's probably
          // a better solution, but for now a check for whether meta[key] exists
          // prevents errors when we try to access the .length property for a set of
          // activities that haven't loaded yet.
          if (meta[key]) {
            meta[key].length = collection.metadata.length;
            collection.metadata = meta;
            self.fetching[key] = false;
          }
        });

        // After a check for activity has completed, no matter the result,
        // schedule another.
        if (this.newContentTimeout) {
          clearTimeout(this.newContentTimeout);
        }
        this.newContentTimeout = setTimeout(_.bind(this.checkForNewActivity, this), this.interval);
      }, this);

      // Don't fetch new activity if we're in the middle of fetching a new page.
      _.each(this.activities, function(collection, key) {
        if (!self.fetching[key]) {
          self.fetching[key] = true;

          // add dataset slug and dataset id paramters
          options.attributesToAdd = { datasetSlug: _.find(self.options.mapConfig.layers, function(layer) { return layer.id == key }).slug,
                                      datasetId: _.find(self.options.mapConfig.layers, function(layer) { return layer.id == key }).id }
          collection.fetch(options);
        } else {
          // Let's wait 5 seconds and try again.
          this.newContentTimeout = setTimeout(_.bind(this.checkForNewActivity, this), 5000);
        }
      });
    },

    // NOTE: we've removed the scroll listener for the time being, as it wasn't in
    // use and has not been refactored for multiple datasets
    // onScroll: function(evt) {
    //   console.log("onScroll");

    //   var self = this,
    //       notFetchingDelay = 500,
    //       notFetching = function() { self.fetching = false; },
    //       shouldFetch = (this.$el.height() - this.$container.height() <=
    //                     this.$container.scrollTop() + this.infiniteScrollBuffer);

    //   if (shouldFetch && !self.fetching) {
    //     self.fetching = true;
    //     this.collection.fetchNextPage(
    //       function() { _.delay(notFetching, notFetchingDelay); },
    //       function() { _.delay(notFetching, notFetchingDelay); }
    //     );
    //   }
    // },

    onAddAction: function(model, collection) {
      this.renderAction(model, collection.indexOf(model));
    },
  
    // closure for onResetActivity
    onResetActivityWrapper: function(datasetId) {
      var self = this;
      return function(collection) {
        self.onResetActivity(datasetId, collection);
      }
    },

    onResetActivity: function(collection) {
      var self = this,
          placeIdsToFetch = [];

      // We have actions to show. Let's make sure we have the places we need
      // to render them. If not, we'll fetch them in bulk and render after.
      collection.each(function(actionModel) {
        var actionType = actionModel.get('target_type'),
            targetData = actionModel.get('target');

        _.each(self.places, function(collection) {
          if (!collection.get(targetData.id)) {
            if (actionType === 'place') {
              placeIdsToFetch.push(targetData.id);
            } else {
              placeIdsToFetch.push(_.last(targetData.place.split('/')));
            }
          }
        });
      });

      if (placeIdsToFetch.length > 0) {
        _.each(self.places, function(collection, key) {
          collection.fetchByIds(placeIdsToFetch, {
            // Check for a valid location type before adding it to the collection
            validate: true,
            attribute: "properties",
            attributesToAdd: { datasetSlug: _.find(self.options.mapConfig.layers, function(layer) { return layer.id == key }).slug,
                               datasetId: _.find(self.options.mapConfig.layers, function(layer) { return layer.id == key }).id },
            success: function() {
              self.render();
            }
          });
        });
      } else {
        self.render();
      }
    },

    preparePlaceData: function(placeModel) {
    },

    processActionData: function(actionModel, placeModel) {
      var actionType = actionModel.get('target_type'),
          isPlaceAction = (actionType === 'place'),
          surveyConfig = this.options.surveyConfig,
          supportConfig = this.options.supportConfig,
          placeData,
          actionData,
          actionText,
          anonSubmitterName,
          placeType = this.options.placeTypes[placeModel.get('location_type')];

      // Handle if an existing place type does not match the list of available
      // place types.
      if (placeType) {
        // Get the place that the action is about.
        if (isPlaceAction) {
          placeData = actionModel.get('target');
          actionText = this.options.placeConfig.action_text;
          anonSubmitterName = this.options.placeConfig.anonymous_name;
        } else {
          placeData = placeModel.toJSON();

          if (actionType === surveyConfig.submission_type) {
            // Survey
            actionText = this.options.surveyConfig.action_text;
            anonSubmitterName = this.options.surveyConfig.anonymous_name;
          } else if (actionType === supportConfig.submission_type) {
            // Support
            actionText = this.options.supportConfig.action_text;
            anonSubmitterName = this.options.supportConfig.anonymous_name;
          }
        }

        // Check whether the location type starts with a vowel; useful for
        // choosing between 'a' and 'an'.  Not language-independent.
        if ('AEIOUaeiou'.indexOf(placeData.location_type[0]) > -1) {
          placeData.type_starts_with_vowel = true;
        }

        placeData.place_type_label = placeType.label || placeData.location_type;

        actionData = _.extend({
          place: placeData,
          is_place: isPlaceAction
        }, actionModel.toJSON());

        // Set action attribute here, because the action model may have it set
        // to something else.
        actionData.action = actionText;

        // Set the submitter_name here in case it is null in the model.
        actionData.target.submitter_name = actionModel.get('target').submitter_name || anonSubmitterName;

        return actionData;
      }  // if (placeType)

      // If the client is not configured for the given placeType, then return
      // no data.
      return null;
    },

    getPlaceForAction: function(actionModel, options) {
      var placeUrl = actionModel.get('target').place,
          placeId, placeModel;
      options = options || {};

      // Check for a valid location type before adding it to the collection
      options.validate = true;

      if (placeUrl) {
        placeId = _.last(placeUrl.split('/'));
      } else {
        placeId = actionModel.get('target').id;
      }

      // If a place with the given ID exists, call success immediately.
      _.each(this.places, function(collection) {
        placeModel = collection.get(placeId);
        if (placeModel && options.success) {
          options.success(placeModel, null, options);
        // Otherwise, fetch the place and pass the callbacks along.
        } else if (!placeModel) {
          // TODO....? Is this else condition necessary any more?
        }
      });
    },

    renderAction: function(model, index) {
      var self = this,
          onFoundPlace;

      // Callback for when the action's corresponding place model is found
      onFoundPlace = function(placeModel) {
        var $template,
            modelData;

        modelData = self.processActionData(model, placeModel);

        if (modelData) {
          $template = $(Handlebars.templates['activity-list-item'](modelData));

          if (index >= self.$el.children().length) {
            self.$el.append($template);
          } else {
            $template
              // Hide first so that slideDown does something
              .hide()
              // Insert before the index-th element
              .insertBefore(self.$el.find('.activity-item:nth-child('+index+1+')'))
              // Nice transition into view ()
              .slideDown();

            // Just adds it with no transition
            // self.$el.find('.activity-item:nth-child('+index+1+')').before($template);
          }
        }
      };

      this.getPlaceForAction(model, {success: onFoundPlace});
    },

    render: function(){
      var self = this,
          index = 0,
          $template,
          modelData,
          collectionData = [],
          placeModel;

      $template = Handlebars.templates['activity-list']({activities: collectionData});
      self.$el.html($template);

      _.each(this.activities, function(collection) {
        self.mergedActivities.add(collection.models);
      });

      self.mergedActivities.each(function(model) {
        self.renderAction(model, index++);
      });

      self.checkForNewActivity();

      return self;
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals _ jQuery L Backbone Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  // Spinner options
  S.bigSpinnerOptions = {
    lines: 13, length: 0, width: 10, radius: 30, corners: 1, rotate: 0,
    direction: 1, color: '#000', speed: 1, trail: 60, shadow: false,
    hwaccel: false, className: 'spinner', zIndex: 2e9, top: 'auto',
    left: 'auto'
  };

  S.smallSpinnerOptions = {
    lines: 13, length: 0, width: 3, radius: 10, corners: 1, rotate: 0,
    direction: 1, color: '#000', speed: 1, trail: 60, shadow: false,
    hwaccel: false, className: 'spinner', zIndex: 2e9, top: 'auto',
    left: 'auto'
  };

  S.AppView = Backbone.View.extend({
    events: {
      'click #add-place': 'onClickAddPlaceBtn',
      'click .close-btn': 'onClickClosePanelBtn'
    },
    initialize: function(){
      var self = this,
          // Only include submissions if the list view is enabled (anything but false)
          includeSubmissions = S.Config.flavor.app.list_enabled !== false,
          placeParams = {
            // NOTE: this is to simply support the list view. It won't
            // scale well, so let's think about a better solution.
            include_submissions: includeSubmissions
          };

      // Use the page size as dictated by the server by default, unless
      // directed to do otherwise in the configuration.
      if (S.Config.flavor.app.places_page_size) {
        placeParams.page_size = S.Config.flavor.app.places_page_size;
      }

      // Boodstrapped data from the page
      this.activities = this.options.activities;
      this.places = this.options.places;
      this.landmarks = this.options.landmarks;

      // Caches of the views (one per place)
      this.placeFormView = null;
      this.placeDetailViews = {};
      this.landmarkDetailViews = {};

      // this flag is used to distinguish between user-initiated zooms and
      // zooms initiated by a leaflet method
      this.isProgrammaticZoom = false;
      this.isStoryActive = false;

      $('body').ajaxError(function(evt, request, settings){
        $('#ajax-error-msg').show();
      });

      $('body').ajaxSuccess(function(evt, request, settings){
        $('#ajax-error-msg').hide();
      });

      $('.list-toggle-btn').click(function(evt){
        evt.preventDefault();
        self.toggleListView();
      });

      $(document).on('click', '.activity-item a', function(evt) {
        window.app.clearLocationTypeFilter();
      });

      // Globally capture clicks. If they are internal and not in the pass
      // through list, route them through Backbone's navigate method.
      $(document).on('click', 'a[href^="/"]', function(evt) {
        var $link = $(evt.currentTarget),
            href = $link.attr('href'),
            url,
            isLinkToPlace = false;

        _.each(self.options.datasetConfigs.places, function(dataset) {
          if (href.indexOf('/' + dataset.slug) === 0) isLinkToPlace = true;
        });

        // Allow shift+click for new tabs, etc.
        if (($link.attr('rel') === 'internal' ||
             href === '/' ||
             isLinkToPlace ||
             href.indexOf('/filter') === 0) &&
             !evt.altKey && !evt.ctrlKey && !evt.metaKey && !evt.shiftKey) {
          evt.preventDefault();

          // Remove leading slashes and hash bangs (backward compatablility)
          url = href.replace(/^\//, '').replace('#!/', '');

          // # Instruct Backbone to trigger routing events
          self.options.router.navigate(url, {
            trigger: true
          });

          return false;
        }
      });

      // On any route (/place or /page), hide the list view
      this.options.router.bind('route', function(route) {
        if (!_.contains(this.getListRoutes(), route) && this.listView && this.listView.isVisible()) {
          this.hideListView();
        }
      }, this);

      // Only append the tools to add places (if supported)
      $('#map-container').append(Handlebars.templates['add-places'](this.options.placeConfig));

      this.pagesNavView = (new S.PagesNavView({
              el: '#pages-nav-container',
              pagesConfig: this.options.pagesConfig,
              router: this.options.router
            })).render();

      this.authNavView = (new S.AuthNavView({
              el: '#auth-nav-container',
              router: this.options.router
            })).render();

      var basemapConfigs = _.find(this.options.sidebarConfig.panels, function(panel) {
        return "basemaps" in panel;
      }).basemaps;
      // Init the map view to display the places
      this.mapView = new S.MapView({
        el: '#map',
        mapConfig: this.options.mapConfig,
        basemapConfigs: basemapConfigs,
        legend_enabled: !!this.options.sidebarConfig.legend_enabled,
        places: this.places,
        landmarks: this.landmarks,
        router: this.options.router,
        placeTypes: this.options.placeTypes,
        cluster: this.options.cluster,
        placeDetailViews: this.placeDetailViews
      });

      if (self.options.sidebarConfig.enabled){
        (new S.SidebarView({
          el: '#sidebar-container',
          mapView: this.mapView,
          sidebarConfig: this.options.sidebarConfig
        })).render();
      }

      // Activity is enabled by default (undefined) or by enabling it
      // explicitly. Set it to a falsey value to disable activity.
      if (_.isUndefined(this.options.activityConfig.enabled) ||
        this.options.activityConfig.enabled) {
        // Init the view for displaying user activity
        this.activityView = new S.ActivityView({
          el: 'ul.recent-points',
          activities: this.activities,
          places: this.places,
          router: this.options.router,
          placeTypes: this.options.placeTypes,
          surveyConfig: this.options.surveyConfig,
          supportConfig: this.options.supportConfig,
          placeConfig: this.options.placeConfig,
          mapConfig: this.options.mapConfig,
          // How often to check for new content
          interval: this.options.activityConfig.interval || 30000
        });
      }

      // Init the address search bar
      this.geocodeAddressView = (new S.GeocodeAddressView({
        el: '#geocode-address-bar',
        router: this.options.router,
        mapConfig: this.options.mapConfig
      })).render();

      // Init the place-counter
      this.placeCounterView = (new S.PlaceCounterView({
        el: '#place-counter',
        router: this.options.router,
        mapConfig: this.options.mapConfig,
        places: this.places
      })).render();

      // When the user chooses a geocoded address, the address view will fire
      // a geocode event on the namespace. At that point we center the map on
      // the geocoded location.
      $(S).on('geocode', function(evt, locationData) {
        self.mapView.zoomInOn(locationData.latLng);

        if (self.isAddingPlace()) {
          self.placeFormView.setLatLng(locationData.latLng);
          // Don't pass location data into our geolocation's form field
          // self.placeFormView.setLocation(locationData);
        }
      });

      // When the map center moves, the map view will fire a mapmoveend event
      // on the namespace. If the move was the result of the user dragging, a
      // mapdragend event will be fired.
      //
      // If the user is adding a place, we want to take the opportunity to
      // reverse geocode the center of the map, if geocoding is enabled. If
      // the user is doing anything else, we just want to clear out any text
      // that's currently set in the address search bar.
      $(S).on('mapdragend', function(evt) {
        if (self.isAddingPlace()) {
          self.conditionallyReverseGeocode();
        } else if (self.geocodeAddressView) {
          self.geocodeAddressView.setAddress('');
        }
      });

      // After reverse geocoding, the map view will fire a reversegeocode
      // event. This should only happen when adding a place while geocoding
      // is enabled.
      $(S).on('reversegeocode', function(evt, locationData) {
        var locationString = Handlebars.templates['location-string'](locationData);
        self.geocodeAddressView.setAddress($.trim(locationString));
        self.geocodeAddressPlaceView.setAddress($.trim(locationString));
        self.placeFormView.setLatLng(locationData.latLng);
        // Don't pass location data into our geolocation's form field
        // self.placeFormView.setLocation(locationData);
      });

      // List view is enabled by default (undefined) or by enabling it
      // explicitly. Set it to a falsey value to disable activity.
      if (_.isUndefined(S.Config.flavor.app.list_enabled) ||
        S.Config.flavor.app.list_enabled) {
          this.listView = new S.PlaceListView({
            el: '#list-container',
            placeCollections: self.places
          }).render();
      }

      // Cache panel elements that we use a lot
      this.$panel = $('#content');
      this.$panelContent = $('#content article');
      this.$panelCloseBtn = $('.close-btn');
      this.$centerpoint = $('#centerpoint');
      this.$addButton = $('#add-place-btn-container');

      // Bind to map move events so we can style our center points
      // with utmost awesomeness.
      this.mapView.map.on('zoomend', this.onMapZoomEnd, this);
      this.mapView.map.on('movestart', this.onMapMoveStart, this);
      this.mapView.map.on('moveend', this.onMapMoveEnd, this);
      // For knowing if the user has moved the map after opening the form.
      this.mapView.map.on('dragend', this.onMapDragEnd, this);

      // If report stories are enabled, build the data structure
      // we need to enable story navigation
      _.each(this.options.storyConfig, function(story) {
        var storyStructure = {},
        totalStoryElements = story.order.length;
        _.each(story.order, function(config, i) {
          storyStructure[config.url] = {
            "zoom": config.zoom || story.default_zoom,
            "panTo": config.panTo || null,
            "visibleLayers": config.visible_layers || story.default_visible_layers,
            "previous": story.order[(i - 1 + totalStoryElements) % totalStoryElements].url,
            "next": story.order[(i + 1) % totalStoryElements].url,
            "basemap": config.basemap || null,
            "spotlight": (config.spotlight === false) ? false : true
          }
        });
        story.order = storyStructure;
      });

      // This is the "center" when the popup is open
      this.offsetRatio = {x: 0.2, y: 0.0};

      _.each(this.places, function(value, key) {
        self.placeDetailViews[key] = {};
      });

      _.each(this.landmarks, function(value, key) {
        self.landmarkDetailViews[key] = {};
      });

      // Show tools for adding data
      this.setBodyClass();
      this.showCenterPoint();

      // Load places from the API
      this.loadPlaces(placeParams);

      // Load landmarks from the API
      this.loadLandmarks();

      // Load activities from the API
      _.each(this.activities, function(collection, key) {
        collection.fetch({
          reset: true,
          attribute: 'target',
          attributesToAdd: { datasetId: _.find(self.options.mapConfig.layers, function(layer) { return layer.id == key }).id,
                             datasetSlug: _.find(self.options.mapConfig.layers, function(layer) { return layer.id == key }).slug }
        });
      });
    },

    getListRoutes: function() {
      // Return a list of the routes that are allowed to show the list view.
      // Navigating to any other route will automatically hide the list view.
      return ['showList', 'filterMap'];
    },

    isAddingPlace: function(model) {
      return this.$panel.is(":visible") && this.$panel.hasClass('place-form');
    },
    loadLandmarks: function() {
      var self = this;

      // loop through landmark configs
      _.each(_.values(this.options.datasetConfigs.landmarks), function(landmarkConfig) {
        if (landmarkConfig.placeType) {
          self.landmarks[landmarkConfig.id].fetch({
            attributesToAdd: { location_type: landmarkConfig.placeType },
          });
        } else {
          self.landmarks[landmarkConfig.id].fetch();
        }
      });
    },

    loadPlaces: function(placeParams) {
      var self = this,
          $progressContainer = $('#map-progress'),
          $currentProgress = $('#map-progress .current-progress'),
          pageSize,
          totalPages,
          pagesComplete = 0;

      // loop over all place collections
      _.each(self.places, function(collection, key) {
        collection.fetchAllPages({
          remove: false,
          // Check for a valid location type before adding it to the collection
          validate: true,
          data: placeParams,
          // get the dataset slug and id from the array of map layers
          attributesToAdd: { datasetSlug: _.find(self.options.mapConfig.layers, function(layer) { return layer.id == key }).slug,
                             datasetId: _.find(self.options.mapConfig.layers, function(layer) { return layer.id == key }).id },
          attribute: 'properties',

          // Only do this for the first page...
          pageSuccess: _.once(function(collection, data) {
            pageSize = data.features.length;
            totalPages = Math.ceil(data.metadata.length / pageSize);

            if (data.metadata.next) {
              $progressContainer.show();
            }
          }),

          // Do this for every page...
          pageComplete: function() {
            var percent;

            pagesComplete++;
            percent = (pagesComplete/totalPages*100);
            $currentProgress.width(percent + '%');

            if (pagesComplete === totalPages) {
              _.delay(function() {
                $progressContainer.hide();
              }, 2000);
            }
          }
        });
      });
    },

    setPlaceFormViewLatLng: function(centerLatLng) {
      if (this.placeFormView) {
        this.placeFormView.setLatLng(centerLatLng);
      }
    },
    onMapZoomEnd: function(evt) {
      if (this.hasBodyClass('content-visible') === true && !this.isProgrammaticZoom) {
        $("#spotlight-place-mask").remove();
      }
      this.isProgrammaticZoom = false;
    },
    onMapMoveStart: function(evt) {
      this.$centerpoint.addClass('dragging');
    },
    onMapMoveEnd: function(evt) {
      var ll = this.mapView.map.getCenter(),
          zoom = this.mapView.map.getZoom();

      this.$centerpoint.removeClass('dragging');

      // Never set the placeFormView's latLng until the user does it with a
      // drag event (below)
      if (this.placeFormView && this.placeFormView.center) {
        this.setPlaceFormViewLatLng(ll);
      }

      if (this.hasBodyClass('content-visible') === false) {
        this.setLocationRoute(zoom, ll.lat, ll.lng);
      }
    },
    onMapDragEnd: function(evt) {
      if (this.hasBodyClass('content-visible') === true) {
        $("#spotlight-place-mask").remove();
      }
      this.setPlaceFormViewLatLng(this.mapView.map.getCenter());
    },
    onClickAddPlaceBtn: function(evt) {
      evt.preventDefault();
      S.Util.log('USER', 'map', 'new-place-btn-click');
      this.options.router.navigate('/new', {trigger: true});
    },
    onClickClosePanelBtn: function(evt) {
      evt.preventDefault();
      if (this.placeFormView) {
        this.placeFormView.closePanel();
      }

      S.Util.log('USER', 'panel', 'close-btn-click');
      // remove map mask if the user closes the side panel
      $("#spotlight-place-mask").remove();
      if (this.mapView.locationTypeFilter) {
        this.options.router.navigate('filter/' + this.mapView.locationTypeFilter, {trigger: true});
      } else {
        this.options.router.navigate('/', {trigger: true});
      }

      if (this.isStoryActive) {
        this.isStoryActive = false;
        this.restoreDefaultLayerVisibility();
      }

    },
    setBodyClass: function(/* newBodyClasses */) {
      var bodyClasses = ['content-visible', 'place-form-visible'],
          newBodyClasses = Array.prototype.slice.call(arguments, 0),
          i, $body = $('body');

      for (i = 0; i < bodyClasses.length; ++i) {
        $body.removeClass(bodyClasses[i]);
      }
      for (i = 0; i < newBodyClasses.length; ++i) {
        // If the newBodyClass isn't among the ones that will be cleared
        // (bodyClasses), then we probably don't want to use this method and
        // should fail loudly.
        if (_.indexOf(bodyClasses, newBodyClasses[i]) === -1) {
          S.Util.console.error('Setting an unrecognized body class.\nYou should probably just use jQuery directly.');
        }
        $body.addClass(newBodyClasses[i]);
      }
    },
    hasBodyClass: function(className) {
      return $('body').hasClass(className);
    },
    conditionallyReverseGeocode: function() {
      if (this.options.mapConfig.geocoding_enabled) {
        this.mapView.reverseGeocodeMapCenter();
      }
    },
    onRemovePlace: function(model) {
      if (this.placeDetailViews[model.cid]) {
        this.placeDetailViews[model.cid].remove();
        delete this.placeDetailViews[model.cid];
      }
    },
    getLandmarkDetailView: function(collectionId, model) {
      var landmarkDetailView;
      if (this.landmarkDetailViews[collectionId] && this.landmarkDetailViews[collectionId][model.id]) {
        landmarkDetailView = this.landmarkDetailViews[collectionId][model.id];
      } else {
        landmarkDetailView = new S.LandmarkDetailView({
          model: model,
          description: model.get('properties')['description'],
          originalDescription: model.get('properties')['originalDescription'],
          mapConfig: this.options.mapConfig,
          mapView: this.mapView,
          router: this.options.router
        });
        this.landmarkDetailViews[collectionId][model.id] = landmarkDetailView;
      }
      return landmarkDetailView;
    },
    getPlaceDetailView: function(model) {
      var placeDetailView;
      if (this.placeDetailViews[model.cid]) {
        placeDetailView = this.placeDetailViews[model.cid];
      } else {
        placeDetailView = new S.PlaceDetailView({
          model: model,
          surveyConfig: this.options.surveyConfig,
          supportConfig: this.options.supportConfig,
          placeConfig: this.options.placeConfig,
          storyConfig: this.options.storyConfig,
          mapConfig: this.options.mapConfig,
          placeTypes: this.options.placeTypes,
          userToken: this.options.userToken,
          mapView: this.mapView,
          router: this.options.router,
          url: _.find(this.options.mapConfig.layers, function(layer) { return layer.slug == model.attributes.datasetSlug }).url,
          datasetId: _.find(this.options.mapConfig.layers, function(layer) { return layer.slug == model.attributes.datasetSlug }).id
        });
        this.placeDetailViews[model.cid] = placeDetailView;
      }

      return placeDetailView;
    },
    setLocationRoute: function(zoom, lat, lng) {
      this.options.router.navigate('/' + zoom + '/' +
        parseFloat(lat).toFixed(5) + '/' + parseFloat(lng).toFixed(5));
    },

    viewMap: function(zoom, lat, lng) {
      var self = this,
          ll;

      // If the map locatin is part of the url already
      if (zoom && lat && lng) {
        ll = L.latLng(parseFloat(lat), parseFloat(lng));

        // Why defer? Good question. There is a mysterious race condition in
        // some cases where the view fails to set and the user is left in map
        // limbo. This condition is seemingly eliminated by defering the
        // execution of this step.
        _.defer(function() {
          self.mapView.map.setView(ll, parseInt(zoom, 10));
        });
      }

      this.hidePanel();
      this.hideNewPin();
      this.destroyNewModels();
      this.setBodyClass();
    },
    newPlace: function() {
      var self = this;

      if (!this.placeFormView) {
        this.placeFormView = new S.PlaceFormView({
          appView: this,
          router: this.options.router,
          placeConfig: this.options.placeConfig,
          mapConfig: this.options.mapConfig,
          userToken: this.options.userToken,
          // only need to send place collection, since all data added will be a place of some kind
          collection: this.places
        });
      }

      this.$panel.removeClass().addClass('place-form');
      this.showPanel(this.placeFormView.render().$el);
      this.placeFormView.postRender();

      this.placeFormView.delegateEvents();
      // Init the place form's address search bar
      this.geocodeAddressPlaceView = (new S.GeocodeAddressPlaceView({
        el: '#geocode-address-place-bar',
        router: this.options.router,
        mapConfig: this.options.mapConfig
      })).render();

      this.showNewPin();
      this.setBodyClass('content-visible', 'place-form-visible');
    },

    // If a model has a story object, set the appropriate layer
    // visilbilities and update legend checkboxes
    setStoryLayerVisibility: function(model) {
      // change basemap if requested
      if (model.attributes.story.basemap) {
        $(S).trigger('visibility', [model.attributes.story.basemap, true, true]);
        $("#map-" + model.attributes.story.basemap).prop("checked", true);
      }
      // set layer visibility based on story config
      _.each(model.attributes.story.visibleLayers, function(targetLayer) {
        $(S).trigger('visibility', [targetLayer, true]);
        // set legend checkbox
        $("#map-" + targetLayer).prop("checked", true);
      });
      // switch off all other layers
      _.each(this.options.mapConfig.layers, function(targetLayer) {
        if (!_.contains(model.attributes.story.visibleLayers, targetLayer.id)) {
          // don't turn off basemap layers!
          if (targetLayer.type != "basemap") {
            $(S).trigger('visibility', [targetLayer.id, false]);
            // set legend checkbox
            $("#map-" + targetLayer.id).prop("checked", false);
          }
        }
      });
    },

    restoreDefaultLayerVisibility: function() {
      var triggerVisibility = function(id, isVisible, isBasemap) {
        $(S).trigger('visibility', [id, isVisible, isBasemap]);
        $("#map-" + id).prop("checked", isVisible);
      }

      var gisLayersPanel = _.find(this.options.sidebarConfig.panels, function(panel) { return panel.id === "gis-layers"; });
      _.each(gisLayersPanel.basemaps, function(basemap) {
        if (basemap.visibleDefault) triggerVisibility(basemap.id, true, true);
      });

      _.each(gisLayersPanel.groupings, function(grouping) {
        _.each(grouping.layers, function(layer) {
          triggerVisibility(layer.id, (layer.visibleDefault ? true : false), false);
        });
      });
    },

    // TODO: Refactor this into 'viewPlace'
    viewLandmark: function(model, options) {
      var self = this,
          includeSubmissions = S.Config.flavor.app.list_enabled !== false,
          layout = S.Util.getPageLayout(),
          onLandmarkFound, onLandmarkNotFound, modelId;

      onLandmarkFound = function(model, response, newOptions) {
        var map = self.mapView.map,
            layer, center, landmarkDetailView, $responseToScrollTo;
        options = newOptions ? newOptions : options;

        layer = self.mapView.layerViews[options.collectionId][model.id].layer

        if (layer) {
          center = layer.getLatLng ? layer.getLatLng() : layer.getBounds().getCenter();
        }
        landmarkDetailView = self.getLandmarkDetailView(options.collectionId, model);

        self.$panel.removeClass().addClass('place-detail place-detail-' + model);
        self.showPanel(landmarkDetailView.render().$el, false);
        landmarkDetailView.delegateEvents();
        self.hideNewPin();
        self.destroyNewModels();
        self.hideCenterPoint();
        self.setBodyClass('content-visible');

        if (layer) {
          if (options.zoom) {
            if (layer.getLatLng) {
              if (model.attributes.story) {
                // TODO(Trevor): this needs to be cleaned up
                self.setStoryLayerVisibility(model);
                self.isProgrammaticZoom = true;
                map.setView(model.attributes.story.panTo || center, model.attributes.story.zoom, {animate: true});
              } else {
                map.setView(center, map.getMaxZoom()-1, {reset: true});
              }
            } else {
              map.fitBounds(layer.getBounds());
            }

          } else {
            if (model.attributes.story) {
              // if this model is part of a story, set center and zoom level
              self.isProgrammaticZoom = true;
              self.setStoryLayerVisibility(model);
              map.setView(model.attributes.story.panTo || center, model.attributes.story.zoom, {animate: true});
            } else {
              map.panTo(center, {animate: true});
            }
          }
        }
        self.addSpotlightMask();

        // Focus the one we're looking
        model.trigger('focus');

        if (model.get("story")) {
          if (!model.get("story").spotlight) $("#spotlight-place-mask").remove();
          self.isStoryActive = true;
          self.setStoryLayerVisibility(model);
        } else if (self.isStoryActive) {
          self.isStoryActive = false;
          self.restoreDefaultLayerVisibility();
        } else {
          self.isStoryActive = false;
        }
      };

      onLandmarkNotFound = function(model, response, newOptions) {
        options.stillSearching[options.collectionId] = false;
        var allCollectionsSearched = true;
        _.each(_.values(options.stillSearching), function(stillSearching) {
          if (stillSearching) {
            allCollectionsSearched = false;
          }
        });
        if (allCollectionsSearched) {
          self.options.router.navigate('/');
        }
      };

      // If a collectionId is not specified, then we need to search all collections
      if (options['collectionId'] === undefined) {
        // First, let's check the caches of all of our collections for the
        // model to avoid making unnecessary api calls for each collection:
        var cachedModel;
        var collectionId;

        _.find(Object.keys(self.options.landmarks), function(landmarkConfigId) {
          collectionId = landmarkConfigId;
          cachedModel = self.landmarks[collectionId].get(model);
          return cachedModel;
        });
        if (cachedModel) {
          onLandmarkFound(cachedModel, {}, { collectionId: collectionId,
                                          zoom: options.zoom });
          return;
        }

        // If the model is not already in our collections, then we must fetch it
        // by making a call to each collection:
        var stillSearching = {};
        _.each(self.options.datasetConfigs.landmarks, function(landmarkConfig) {
          stillSearching[landmarkConfig.id] = true;
        });
        _.each(self.options.datasetConfigs.landmarks, function(landmarkConfig) {
          self.viewLandmark(model, { collectionId: landmarkConfig.id,
                                     zoom: options.zoom,
                                     stillSearching: stillSearching });
        });
        return;
      }

      // If we are passed a LandmarkModel then show it immediately.
      if (model instanceof S.LandmarkModel) {
        onLandmarkFound(model)
        return;
      }

      // Otherwise, assume we have a model ID.
      modelId = model;
      var landmarkCollection = this.landmarks[options.collectionId];
      if (!landmarkCollection) {
        onLandmarkNotFound();
        return;
      }
      model = landmarkCollection.get(modelId);

      // If the model was found in the landmarks, go ahead and use it.
      if (model) {
        onLandmarkFound(model);

      // Otherwise, fetch and use the result.
      } else {
        landmarkCollection.fetch({
          success: function(collection, response, options) {
            var foundModel = collection.findWhere({ id: modelId });
            if (foundModel) {
              onLandmarkFound(foundModel);
            } else {
              onLandmarkNotFound();
            }
          },
          error: onLandmarkNotFound
        })
      }
    },
    viewPlace: function(datasetSlug, model, responseId, zoom) {
      var self = this,
          includeSubmissions = S.Config.flavor.app.list_enabled !== false,
          layout = S.Util.getPageLayout(),
          // get the dataset id from the map layers array for the given datasetSlug
          datasetId = _.find(self.options.mapConfig.layers, function(layer) { return layer.slug == datasetSlug }).id,
          onPlaceFound, onPlaceNotFound, modelId;

      onPlaceFound = function(model) {
        var map = self.mapView.map,
            layer, center, placeDetailView, $responseToScrollTo;

        // If this model is a duplicate of one that already exists in the
        // places collection, it may not correspond to a layerView. For this
        // case, get the model that's actually in the places collection.
        if (_.isUndefined(self.mapView.layerViews[model.cid])) {
          model = self.places[datasetId].get(model.id);
        }

        // TODO: We need to handle the non-deterministic case when
        // 'self.mapView.layerViews[model.cid]` is undefined
        if (self.mapView.layerViews[datasetId] && self.mapView.layerViews[datasetId][model.cid]) {
          layer = self.mapView.layerViews[datasetId][model.cid].layer;
        }

        placeDetailView = self.getPlaceDetailView(model);

        if (layer) {
          center = layer.getLatLng ? layer.getLatLng() : layer.getBounds().getCenter();
        }

        self.$panel.removeClass().addClass('place-detail place-detail-' + model.id);
        self.showPanel(placeDetailView.render().$el, !!responseId);
        placeDetailView.delegateEvents();
        // TODO(Trevor): prevent default form behavior when in editing mode

        self.hideNewPin();
        self.destroyNewModels();
        self.hideCenterPoint();
        self.setBodyClass('content-visible');

        if (layer) {
          if (zoom) {
            if (layer.getLatLng) {
              if (model.attributes.story) {
                // TODO(Trevor): this needs to be cleaned up
                self.isProgrammaticZoom = true;
                self.setStoryLayerVisibility(model);
                map.setView(model.attributes.story.panTo || center, model.attributes.story.zoom, {animate: true});
              } else {
                map.setView(center, map.getMaxZoom()-1, {reset: true});
              }
            } else {
              map.fitBounds(layer.getBounds());
            }

          } else {
            if (model.attributes.story) {
              self.isProgrammaticZoom = true;
              self.setStoryLayerVisibility(model);
              map.setView(model.attributes.story.panTo || center, model.attributes.story.zoom, {animate: true});
            } else {
              map.panTo(center, {animate: true});
            }
          }
        }
        self.addSpotlightMask();

        if (responseId) {
          // get the element based on the id
          $responseToScrollTo = placeDetailView.$el.find('[data-response-id="'+ responseId +'"]');

          // call scrollIntoView()
          if ($responseToScrollTo.length > 0) {
            if (layout === 'desktop') {
              // For desktop, the panel content is scrollable
              self.$panelContent.scrollTo($responseToScrollTo, 500);
            } else {
              // For mobile, it's the window
              $(window).scrollTo($responseToScrollTo, 500);
            }
          }
        }

        // Focus the one we're looking
        model.trigger('focus');

        if (model.get("story")) {
          if (!model.get("story").spotlight) $("#spotlight-place-mask").remove();
          self.isStoryActive = true;
          self.setStoryLayerVisibility(model);
        } else if (self.isStoryActive) {
          self.isStoryActive = false;
          self.restoreDefaultLayerVisibility();
        } else {
          self.isStoryActive = false;
        }
      };

      onPlaceNotFound = function() {
        self.options.router.navigate('/');
      };

      // If we get a PlaceModel then show it immediately.
      if (model instanceof S.PlaceModel) {
        onPlaceFound(model);
        return;
      }

      // Otherwise, assume we have a model ID.
      modelId = model;
      model = this.places[datasetId].get(modelId);

      // If the model was found in the places, go ahead and use it.
      if (model) {
        onPlaceFound(model);

      // Otherwise, fetch and use the result.
      } else {
        this.places[datasetId].fetchById(modelId, {
          // Check for a valid location type before adding it to the collection
          validate: true,
          success: onPlaceFound,
          error: onPlaceNotFound,
          data: {
            include_submissions: includeSubmissions
          }
        });
      }
    },
    viewPage: function(slug) {
      var pageConfig = S.Util.findPageConfig(this.options.pagesConfig, {slug: slug}),
          pageTemplateName = 'pages/' + (pageConfig.name || pageConfig.slug),
          pageHtml = Handlebars.templates[pageTemplateName]({config: this.options.config});

      this.$panel.removeClass().addClass('page page-' + slug);
      this.showPanel(pageHtml);

      this.hideNewPin();
      this.destroyNewModels();
      this.hideCenterPoint();
      this.setBodyClass('content-visible');
    },
    showPanel: function(markup, preventScrollToTop) {
      console.log("show panel");

      // if new panel content would replace an open, unsaved place detail
      // view in editor mode, we need to stop the new content from being inserted
      // and prompt the user
      console.log("this.$panel", this.$panel);
      if (this.$panel.hasClass("place-detail")) { console.log("replacing place detail") }

      var map = this.mapView.map;

      this.unfocusAllPlaces();

      this.$panelContent.html(markup);
      this.$panel.show();

      if (!preventScrollToTop) {
        // will be "mobile" or "desktop", as defined in default.css
        var layout = S.Util.getPageLayout();
        if (layout === 'desktop') {
          // For desktop, the panel content is scrollable
          this.$panelContent.scrollTo(0, 0);
        } else {
          // Scroll to the top of window when showing new content on mobile. Does
          // nothing on desktop. (Except when embedded in a scrollable site.)
          window.scrollTo(0, 0);
        }
      }

      this.setBodyClass('content-visible');
      map.invalidateSize({ animate:true, pan:true });

      $(S).trigger('panelshow', [this.options.router, Backbone.history.getFragment()]);

      $("#add-place-btn-container").attr("class", "pos-top-left");

      S.Util.log('APP', 'panel-state', 'open');
    },
    showNewPin: function() {
      this.$centerpoint.show().addClass('newpin');

      this.addSpotlightMask();
    },
    showAddButton: function() {
      this.$addButton.show();
    },
    hideAddButton: function() {
      this.$addButton.hide();
    },
    showCenterPoint: function() {
      this.$centerpoint.show().removeClass('newpin');
    },
    hideCenterPoint: function() {
      this.$centerpoint.hide();
    },
    hidePanel: function() {
      var map = this.mapView.map;

      this.unfocusAllPlaces();
      this.$panel.hide();
      this.setBodyClass();
      map.invalidateSize({ animate:true, pan:true });

      $("#add-place-btn-container").attr("class", "pos-top-right");

      S.Util.log('APP', 'panel-state', 'closed');
      $("#spotlight-place-mask").remove();
    },
    hideNewPin: function() {
      this.showCenterPoint();
    },
    addSpotlightMask: function() {
      // remove an existing mask
      $("#spotlight-place-mask").remove();

      // add map mask and spotlight effect
      var spotlightDiameter = 200,
          xOffset = $("#map").width() / 2 - (spotlightDiameter / 2),
          yOffset = $("#map").height() / 2 - (spotlightDiameter / 2);
      $("#map").append("<div id='spotlight-place-mask'><div id='spotlight-place-mask-fill'></div></div>");
      $("#spotlight-place-mask-fill").css("left", xOffset + "px")
                               .css("top", yOffset + "px")
                               .css("width", spotlightDiameter + "px")
                               .css("height", spotlightDiameter + "px")
                               // scale the box shadow to the largest screen dimension; an arbitrarily large box shadow won't get drawn in Safari
                               .css("box-shadow", "0px 0px 0px " + Math.max((yOffset * 2), (xOffset * 2)) + "px rgba(0,0,0,0.4), inset 0px 0px 20px 30px rgba(0,0,0,0.4)");
    },
    unfocusAllPlaces: function() {
      // Unfocus all of the place markers
      _.each(this.places, function(collection) {
        collection.each(function(model) {
          if (!model.isNew()) {
            model.trigger('unfocus');
          }
        });
      });

      // Unfocus all of the landmark markers
      _.each(this.landmarks, function(collection) {
        collection.each(function(model) {
          if (!model.isNew()) {
            model.trigger('unfocus');
          }
        });
      });
    },
    destroyNewModels: function() {
      _.each(this.places, function(collection) {
        collection.each(function(model) {
          if (model && model.isNew()) {
            model.destroy()
          }
        });
      });

      _.each(this.landmarks, function(collection) {
        collection.each(function(model) {
          if (model && model.isNew()) {
            model.destroy()
          }
        });
      });
    },

    render: function() {
      this.mapView.render();
    },
    showListView: function() {
      // Re-sort if new places have come in
      this.listView.sort();
      // Show
      this.listView.$el.addClass('is-exposed');
      $('.show-the-list').addClass('is-visuallyhidden');
      $('.show-the-map').removeClass('is-visuallyhidden');
    },
    hideListView: function() {
      this.listView.$el.removeClass('is-exposed');
      $('.show-the-list').removeClass('is-visuallyhidden');
      $('.show-the-map').addClass('is-visuallyhidden');
    },
    toggleListView: function() {
      if (this.listView.isVisible()) {
        this.viewMap();
        this.hideListView();
        this.options.router.navigate('');
      } else {
        this.showListView();
        this.options.router.navigate('list');
      }
      this.mapView.clearFilter();
    }
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals L Backbone _ jQuery */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LayerView = Backbone.View.extend({
     // A view responsible for the representation of a place on the map.
    initialize: function(){
      this.map = this.options.map;
      this.isFocused = false;

      // A throttled version of the render function
      this.throttledRender = _.throttle(this.render, 300);

      this.map.on('zoomend', this.updateLayer, this);

      // Bind model events
      this.model.on('change', this.updateLayer, this);
      this.model.on('focus', this.focus, this);
      this.model.on('unfocus', this.unfocus, this);
      this.model.on('destroy', this.onDestroy, this);
      
      // On map move, adjust the visibility of the markers for max efficiency
      this.map.on('move', this.throttledRender, this);

      this.initLayer();
    },
    initLayer: function() {
      var geom, context;

      // Handle if an existing place type does not match the list of available
      // place types.
      this.placeType = this.options.placeTypes[this.model.get('location_type')];
      if (!this.placeType) {
        console.warn('Place type', this.model.get('location_type'),
          'is not configured so it will not appear on the map.');
        return;
      }

      // Don't draw new places. They are shown by the centerpoint in the app view
      if (!this.model.isNew()) {

        // Determine the style rule to use based on the model data and the map
        // state.
        context = _.extend({},
          this.model.toJSON(),
          {map: {zoom: this.map.getZoom()}},
          {layer: {focused: this.isFocused}});
        // Set the icon here:
        this.styleRule = L.Argo.getStyleRule(context, this.placeType.rules);

        // Zoom checks here, for overriding the icon size, anchor, and focus icon:
        if (this.placeType.hasOwnProperty('zoomType')) {
          var zoomRules = this.options.placeTypes[this.placeType.zoomType];
          this.styleRule = L.Argo.getZoomRule(this.styleRule, zoomRules);
        }

        // Construct an appropriate layer based on the model geometry and the
        // style rule. If the place is focused, use the 'focus_' portion of
        // the style rule if it exists.
        geom = this.model.get('geometry');
        if (geom.type === 'Point') {
          this.latLng = L.latLng(geom.coordinates[1], geom.coordinates[0]);
          if (this.hasIcon()) {
            this.layer = (this.isFocused && this.styleRule.focus_icon ?
              L.marker(this.latLng, {icon: L.icon(this.styleRule.focus_icon)}) :
              L.marker(this.latLng, {icon: L.icon(this.styleRule.icon)}));
          } else if (this.hasStyle()) {
            this.layer = (this.isFocused && this.styleRule.focus_style ?
              L.circleMarker(this.latLng, this.styleRule.focus_style) :
              L.circleMarker(this.latLng, this.styleRule.style));
          }
        } else {
          this.layer = L.GeoJSON.geometryToLayer(geom);
          this.layer.setStyle(this.styleRule.style);
        }

        // Focus on the layer onclick
        if (this.layer) {
          this.layer.on('click', this.onMarkerClick, this);
        }

        this.render();
      }
    },
    onDestroy: function() {
      // NOTE: it's necessary to remove the zoomend event here
      // so this view won't try to recreate a marker when the map is
      // zoomed. Somehow even when a layer view is removed, the
      // zoomend listener on the map still retains a reference to it
      // and is capable of calling view methods on a "deleted" view.
      this.map.off('zoomend', this.updateLayer, this);
    },
    updateLayer: function() {
      // Update the marker layer if the model changes and the layer exists
      this.removeLayer();
      this.initLayer();
    },
    removeLayer: function() {
      if (this.layer) {
        this.options.layer.removeLayer(this.layer);
      }
    },
    render: function() {
      // Show if it is within the current map bounds
      var mapBounds = this.map.getBounds();

      if (this.latLng) {
        if (mapBounds.contains(this.latLng)) {
          this.show();
        } else {
          this.hide();
        }
      } else {
        this.show();
      }
    },
    onMarkerClick: function() {
      S.Util.log('USER', 'map', 'place-marker-click', this.model.getLoggingDetails());
      this.options.router.navigate('/' + this.model.get('datasetSlug') + '/' + this.model.id, {trigger: true});
    },

    isPoint: function() {
      return this.model.get('geometry').type == 'Point';
    },
    hasIcon: function() {
      return this.styleRule && this.styleRule.icon;
    },
    hasStyle: function() {
      return this.styleRule && this.styleRule.style;
    },

    focus: function() {
      if (!this.isFocused) {
        this.isFocused = true;
        this.updateLayer();
      }
    },
    unfocus: function() {
      if (this.isFocused) {
        this.isFocused = false;
        this.updateLayer();
      }
    },
    remove: function() {
      this.removeLayer();
      this.map.off('move', this.throttledRender, this);
    },
    setIcon: function(icon) {
      if (this.layer) {
        this.layer.setIcon(icon);
      }
    },
    show: function() {
      if (!this.options.mapView.locationTypeFilter ||
        this.options.mapView.locationTypeFilter.toUpperCase() === this.model.get('location_type').toUpperCase()) {
        if (this.layer) {
          this.options.layer.addLayer(this.layer);
        }
      } else {
        this.hide();
      }

    },
    hide: function() {
      this.removeLayer();
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals L Backbone _ jQuery */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.BasicLayerView = S.LayerView.extend({
    initialize: function() {
      S.LayerView.prototype.initialize.call(this)
    },
    removeLayer: function() {
      if (this.layer) {
        this.options.layer.removeLayer(this.layer);
      }
    },
    onMarkerClick: function() {
      S.Util.log('USER', 'map', 'landmark-layer-click', this.model.getLoggingDetails());
      this.options.router.navigate('/' + this.model.id, {trigger: true});
    },
    show: function() {
      if (!this.options.mapView.locationTypeFilter ||
        this.options.mapView.locationTypeFilter.toUpperCase() === this.model.get('location_type').toUpperCase()) {
        if (this.layer) {
          this.options.layer.addLayer(this.layer);
        }
      } else {
        this.hide();
      }
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals Backbone */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceCounterView = Backbone.View.extend({
    initialize: function() {
      var self = this;
      self.numberOfPlaces = 0;

      _.each(this.options.places.duwamish, function(collection) {
        self.numberOfPlaces += collection.models.length;

        // Bind data events
        collection.on('reset', self.render, self);
        collection.on('add', self.incrementPlaces, self);
        collection.on('remove', self.decrementPlaces, self);
      });
    },
    incrementPlaces: function() {
      this.numberOfPlaces++;
      this.render();
    },
    decrementPlaces: function() {
      this.numberOfPlaces--;
      this.render();
    },
    render: function() {
      var data = {
        //length: S.TemplateHelpers.formatNumber(this.collection.models.length),
        meter_config: this.options.mapConfig,
        value: this.numberOfPlaces,
        value_pretty: S.TemplateHelpers.formatNumber(this.numberOfPlaces),
        counter_max_pretty: S.TemplateHelpers.formatNumber(this.options.mapConfig.counter_max)
      };
      this.$el.html(Handlebars.templates['count-meter'](data));
      return this;
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals L Backbone _ Handlebars jQuery Spinner */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.GeocodeAddressView = Backbone.View.extend({
    events: {
      'submit .geocode-address-form': 'onGeocodeAddress',
      'change .geocode-address-field': 'onAddressChange'
    },
    render: function() {
      var data = this.options.mapConfig;
      this.$el.html(Handlebars.templates['geocode-address'](data));
      return this;
    },
    onAddressChange: function(evt) {
      // .hide().addClass('is-hidden') is a bit redundant, but the .hide
      // is so that we can do a fade-in effect.
      this.$('.error').hide().addClass('is-hidden');
    },
    onGeocodeAddress: function(evt) {
      evt.preventDefault();
      var self = this,
          $address = this.$('.geocode-address-field'),
          address = $address.val(),
          geocodingEngine = this.options.mapConfig.geocoding_engine || 'MapQuest',
          hint = this.options.mapConfig.geocode_bounding_box ||
                 this.options.mapConfig.geocode_hint;

      // Show the spinner
      self.$('.geocode-spinner').removeClass('is-hidden');
      // Make sure there's only one spinner created. Do it here so the element
      // is visible and it gets rendered nicely.
      if (self.$('.geocode-spinner > .spinner').length === 0) {
        new Spinner(S.smallSpinnerOptions).spin(this.$('.geocode-spinner')[0]);
      }


      S.Util[geocodingEngine].geocode(address, hint, {
        success: function(data) {
          var locationsData = data.results[0].locations;
          // Hide the spinner
          self.$('.geocode-spinner').addClass('is-hidden');

          // console.log('Geocoded data: ', data);
          if (locationsData.length > 0) {
            // self.$('.error').hide().addClass('is-hidden');

            // TODO: This might make more sense if the view itself was the
            //       event's target.
            $(S).trigger('geocode', [locationsData[0]]);
          } else {
            // TODO: Show some feedback that we couldn't geocode.
            console.error('Woah, no location found for ', data.results[0].providedLocation.location, data);
            self.$('.error').removeClass('is-hidden').hide().fadeIn().html('Could not find that location.');
          }
        },
        error: function() {
          console.error('There was an error while geocoding: ', arguments);
          self.$('.loading').addClass('is-hidden');
        }
      });

      S.Util.log('USER', 'geocoder', 'geocode-address', address);
    },
    setAddress: function(location) {
      var $address = this.$('.geocode-address-field');
      $address.val(location).change();
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals L Backbone _ Handlebars jQuery Spinner */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.GeocodeAddressPlaceView = S.GeocodeAddressView.extend({
    events: {
      'change .geocode-address-field': 'onAddressChange',
      'blur .geocode-address-field': 'onGeocodeAddress'
    },
    render: function() {
      return this;
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.SupportView = Backbone.View.extend({
    events: {
      'change #support': 'onSupportChange'
    },

    initialize: function() {
      this.collection.on('reset', this.onChange, this);
      this.collection.on('add', this.onChange, this);
      this.collection.on('remove', this.onChange, this);

      this.updateSupportStatus();
    },

    render: function() {
      // I don't understand why we need to redelegate the event here, but they
      // are definitely unbound after the first render.
      this.delegateEvents();

      this.$el.html(Handlebars.templates['place-detail-support']({
        count: this.collection.size() || '',
        user_token: this.options.userToken,
        is_supporting: (this.userSupport !== undefined),
        support_config: this.options.supportConfig
      }));

      return this;
    },

    remove: function() {
      // Nothing yet
    },

    getSupportStatus: function(userToken) {
      return this.collection.find(function(model) {
        return model.get('user_token') === userToken;
      });
    },

    updateSupportStatus: function() {
      this.userSupport = this.getSupportStatus(this.options.userToken);
    },

    onChange: function() {
      this.updateSupportStatus();
      this.render();
    },

    onSupportChange: function(evt) {
      var self = this,
          checked = evt.target.checked,
          $form,
          attrs,
          userSupport;

      evt.target.disabled = true;
      S.Util.log('USER', 'place', 'support-btn-click', self.collection.options.placeModel.getLoggingDetails(), self.collection.size());

      if (checked) {
        $form = this.$('form');
        attrs = S.Util.getAttrs($form);
        this.collection.create(attrs, {
          wait: true,
          beforeSend: function($xhr) {
            // Do not generate activity for anonymous supports
            if (!S.bootstrapped.currentUser) {
              $xhr.setRequestHeader('X-Shareabouts-Silent', 'true');
            }
          },
          success: function() {
            S.Util.log('USER', 'place', 'successfully-support', self.collection.options.placeModel.getLoggingDetails());
          },
          error: function() {
            self.getSupportStatus(self.options.userToken).destroy();
            alert('Oh dear. It looks like that didn\'t save.');
            S.Util.log('USER', 'place', 'fail-to-support', self.collection.options.placeModel.getLoggingDetails());
          }
        });
      } else {
        userSupport = this.userSupport;
        this.userSupport.destroy({
          wait: true,
          success: function() {
            S.Util.log('USER', 'place', 'successfully-unsupport', self.collection.options.placeModel.getLoggingDetails());
          },
          error: function() {
            self.collection.add(userSupport);
            alert('Oh dear. It looks like that didn\'t save.');
            S.Util.log('USER', 'place', 'fail-to-unsupport', self.collection.options.placeModel.getLoggingDetails());
          }
        });
      }
    }
  });

})(Shareabouts, jQuery, Shareabouts.Util.console);

/*globals jQuery Backbone _ Handlebars Spinner Gatekeeper */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.SurveyView = Backbone.View.extend({
    events: {
      'submit form': 'onSubmit',
      'click .reply-link': 'onReplyClick',
      'click .update-response-btn': 'onUpdateResponse',
      'click .delete-response-btn': 'onDeleteResponse'
    },
    initialize: function() {
      S.TemplateHelpers.insertInputTypeFlags(this.options.surveyConfig.items);

      this.collection.on('reset', this.onChange, this);
      this.collection.on('add', this.onChange, this);

      this.updateSubmissionStatus();
    },

    getSubmissionStatus: function(userToken) {
      return this.collection.find(function(model) {
        return model.get('user_token') === userToken;
      });
    },

    updateSubmissionStatus: function() {
      this.userSubmission = this.getSubmissionStatus(this.options.userToken);
    },

    render: function() {
      var self = this,
          responses = [],
          url = window.location.toString(),
          urlParts = url.split('response/'),
          layout = S.Util.getPageLayout(),
          responseIdToScrollTo, $responseToScrollTo, data;

      // get the response id from the url
      if (urlParts.length === 2) {
        responseIdToScrollTo = urlParts[1];
      }

      // I don't understand why we need to redelegate the event here, but they
      // are definitely unbound after the first render.
      this.delegateEvents();

      // Responses should be an array of objects with submitter_name,
      // pretty_created_datetime, and items (name, label, and prompt)
      this.collection.each(function(model, i) {
        var items = S.TemplateHelpers.getItemsFromModel(self.options.surveyConfig.items, model, ['submitter_name']);

        responses.push(_.extend(model.toJSON(), {
          submitter_name: model.get('submitter_name') || self.options.surveyConfig.anonymous_name,
          cid: model.cid,
          pretty_created_datetime: S.Util.getPrettyDateTime(model.get('created_datetime'),
            self.options.surveyConfig.pretty_datetime_format),
          items: items
        }));
      });

      data = _.extend({
        responses: responses,
        has_single_response: (responses.length === 1),
        user_token: this.options.userToken,
        user_submitted: !!this.userSubmission,
        survey_config: this.options.surveyConfig,
        isEditingToggled: this.options.placeDetailView.isEditingToggled
      }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['place-detail-survey'](data));

      // get the element based on the id
      $responseToScrollTo = this.$el.find('[data-response-id="'+ responseIdToScrollTo +'"]');

      // call scrollIntoView()
      if ($responseToScrollTo.length > 0) {
        setTimeout(function() {
          // For desktop, the panel content is scrollable
          if (layout === 'desktop') {
            $('#content article').scrollTo($responseToScrollTo);
          } else {
            // For mobile, it's the window
            $(window).scrollTo($responseToScrollTo);
          }
        }, 700);
      }

      if (this.options.placeDetailView.isEditingToggled) {
        var editEvents = "change keyup";
        $.each(this.$el.find(".responses form"), function() {
          $(this).on(editEvents, function() {
            $(this).siblings(".btn-update").removeClass("faded").prop("disabled", false);
          });
        });
      }

      return this;
    },

    remove: function() {
      this.unbind();
      this.$el.remove();
    },

    onChange: function() {
      this.updateSubmissionStatus();
      this.render();
    },

    onSubmit: Gatekeeper.onValidSubmit(function(evt) {
      evt.preventDefault();
      var self = this,
          $form = this.$('form'),
          $button = this.$('[name="commit"]'),
          attrs = S.Util.getAttrs($form),
          spinner;

      // Disable the submit button until we're done, so that the user doesn't
      // over-click it
      $button.attr('disabled', 'disabled');
      spinner = new Spinner(S.smallSpinnerOptions).spin(this.$('.form-spinner')[0]);

      S.Util.log('USER', 'place', 'submit-reply-btn-click', this.collection.options.placeModel.getLoggingDetails(), this.collection.size());

      S.Util.setStickyFields(attrs, S.Config.survey.items, S.Config.place.items);

      // Create a model with the attributes from the form
      this.collection.create(attrs, {
        wait: true,
        success: function() {
          // Clear the form
          $form.get(0).reset();
          S.Util.log('USER', 'place', 'successfully-reply', self.collection.options.placeModel.getLoggingDetails());
        },
        error: function() {
          S.Util.log('USER', 'place', 'fail-to-reply', self.collection.options.placeModel.getLoggingDetails());
        },
        complete: function() {
          // No matter what, enable the button
          $button.removeAttr('disabled');
          spinner.stop();
        }
      });
    }),

    onReplyClick: function(evt) {
      evt.preventDefault();
      this.$('textarea, input').not('[type="hidden"]').first().focus();
      S.Util.log('USER', 'place', 'leave-reply-btn-click', this.collection.options.placeModel.getLoggingDetails(), this.collection.size());
    },

    onUpdateResponse: function(evt) {
      var cid = $(evt.target).parent().data("cid"),
      model = this.collection.get(cid),
      $form = $(evt.target).siblings("form"),
      attrs = S.Util.getAttrs($form);
      model.set(attrs).save({}, {
        success: function() {
          $(evt.target).addClass("faded").prop("disabled", true);
        }
      });
    },

    onDeleteResponse: function(evt) {
      var response = confirm("You are deleting this comment permanently. Are you sure you want to continue?");
      if (response) {
        var cid = $(evt.target).parent().data("cid"),
        model = this.collection.get(cid);
        model.destroy();
        this.render();
      }
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals jQuery Backbone _ Handlebars Spinner Gatekeeper */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LandmarkSurveyView = S.SurveyView.extend({
    initialize: function() {
    },

    render: function() {
      var self = this,
          layout = S.Util.getPageLayout(),
          responseIdToScrollTo, $responseToScrollTo, data;

      this.$el.html(Handlebars.templates['place-detail-survey']({}));

      // get the element based on the id
      $responseToScrollTo = this.$el.find('[data-response-id="'+ responseIdToScrollTo +'"]');

      if ($responseToScrollTo.length > 0) {
        setTimeout(function() {
          // For desktop, the panel content is scrollable
          if (layout === 'desktop') {
            $('#content article').scrollTo($responseToScrollTo);
          } else {
            // For mobile, it's the window
            $(window).scrollTo($responseToScrollTo);
          }
        }, 700);
      }
      return this;
    }
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceDetailView = Backbone.View.extend({
    events: {
      'click .place-story-bar .btn-previous-story-nav': 'onClickStoryPrevious',
      'click .place-story-bar .btn-next-story-nav': 'onClickStoryNext',
      'click #toggle-editor-btn': 'onToggleEditMode',
      'click #update-place-model-btn': 'onUpdateModel',
      'click #hide-place-model-btn': 'onHideModel',
      'click input[data-input-type="binary_toggle"]': 'onBinaryToggle',
      'change input[type="file"]': 'onInputFileChange',
    },
    initialize: function() {
      var self = this;

      // should we display the toggle edit mode button?
      this.isEditable = false;
      // should we display editable fields?
      this.isEditingToggled = false;
      this.surveyType = this.options.surveyConfig.submission_type;
      this.supportType = this.options.supportConfig.submission_type;
      this.isModified = false;

      this.model.on('change', this.onChange, this);

      // Make sure the submission collections are set
      this.model.submissionSets[this.surveyType] = this.model.submissionSets[this.surveyType] ||
        new S.SubmissionCollection(null, {
          submissionType: this.surveyType,
          placeModel: this.model
        });

      this.model.submissionSets[this.supportType] = this.model.submissionSets[this.supportType] ||
        new S.SubmissionCollection(null, {
          submissionType: this.supportType,
          placeModel: this.model
        });

      this.surveyView = new S.SurveyView({
        collection: this.model.submissionSets[this.surveyType],
        surveyConfig: this.options.surveyConfig,
        userToken: this.options.userToken,
        datasetId: self.options.datasetId,
        placeDetailView: self
      });

      this.supportView = new S.SupportView({
        collection: this.model.submissionSets[this.supportType],
        supportConfig: this.options.supportConfig,
        userToken: this.options.userToken,
        datasetId: self.options.datasetId
      });

      // fetch comments here instead of in render(), to avoid fetching on
      // a re-render and possibly conflicting with in-progress update/delete calls
      this.model.submissionSets[this.surveyType].fetchAllPages();

      this.$el.on('click', '.share-link a', function(evt){

        // HACK! Each action should have its own view and bind its own events.
        var shareTo = this.getAttribute('data-shareto');

        S.Util.log('USER', 'place', shareTo, self.model.getLoggingDetails());
      });

      // Is this user authenticated (i.e. able to edit place detail views)?
      if (S.bootstrapped.currentUser && S.bootstrapped.currentUser.groups) {
        _.each(S.bootstrapped.currentUser.groups, function(group) {
          // get the name of the datasetId from the end of the full url
          // provided in S.bootstrapped.currentUser.groups
          var url = group.dataset.split("/"),
          match = url[url.length - 1];
          if (match && match === self.options.datasetId && group.name === "administrators") {
            self.isEditable = true;
          }
        });
      }

      this.model.attachmentCollection.on("add", this.onAddAttachment, this);
    },

    onClickStoryPrevious: function() {
      this.options.router.navigate(this.model.attributes.story.previous, {trigger: true});
    },

    onClickStoryNext: function() {
      this.options.router.navigate(this.model.attributes.story.next, {trigger: true});
    },

    close: function() {
      console.log("on close");

    },

    onToggleEditMode: function() {
      console.log("this.isModified", this.isModified);

      if (this.isEditingToggled && this.isModified) {
        if(!confirm("You have unsaved changes. Proceed?")) return;
      }

      var toggled = !this.isEditingToggled;
      this.isEditingToggled = toggled;
      this.surveyView.options.isEditingToggled = toggled;
      this.render();
    },

    render: function() {
      console.log("place detail view render")

      var self = this,
          data = _.extend({
            place_config: this.options.placeConfig,
            survey_config: this.options.surveyConfig,
            url: this.options.url,
            isEditable: self.isEditable || false,
            isEditingToggled: self.isEditingToggled || false
          }, this.model.toJSON());

      data.submitter_name = this.model.get('submitter_name') ||
        this.options.placeConfig.anonymous_name;

      // Augment the template data with the attachments list
      data.attachments = this.model.attachmentCollection.toJSON();

      this.$el.html(Handlebars.templates['place-detail'](data));

      // Render the view as-is (collection may have content already)
      this.$('.survey').html(this.surveyView.render().$el);

      this.$('.support').html(this.supportView.render().$el);
      // Fetch for submissions and automatically update the element
      this.model.submissionSets[this.supportType].fetchAllPages();

      this.delegateEvents();
      this.surveyView.delegateEvents();

      $("#content article").animate({ scrollTop: 0 }, "fast");
      
      // initialize datetime picker, if relevant
      $('#datetimepicker').datetimepicker({ formatTime: 'g:i a' }); // <-- add to datetimepicker, or could be a handlebars helper?

      if (this.isEditingToggled) {
        var editEvents = "change keyup";
        $("#toggle-editor-btn").addClass("btn-depressed");
        $(".promotion, .place-submission-details, .survey-header, .reply-link, .response-header").addClass("faded");
        $("#update-place-model-form, #update-place-model-title-form").on(editEvents, function() {
          self.isModified = true;
          $("#update-place-model-btn").css({"opacity": "1.0", "cursor": "pointer"});
          $(this).off(editEvents);
        });
      }

      return this;
    },

    remove: function() {
      // Nothing yet
    },

    onChange: function() {
      this.render();
    },

    onInputFileChange: function(evt) {
      var self = this,
          file,
          attachment;

      if(evt.target.files && evt.target.files.length) {
        file = evt.target.files[0];

        this.$('.fileinput-name').text(file.name);
        S.Util.fileToCanvas(file, function(canvas) {
          canvas.toBlob(function(blob) {
            //var fieldName = $(evt.target).attr('name'),
            var fieldName = Math.random().toString(36).substring(7),
                data = {
                  name: fieldName,
                  blob: blob,
                  file: canvas.toDataURL('image/jpeg')
                };

            attachment = self.model.attachmentCollection.find(function(model) {
              return model.get('name') === fieldName;
            });

            if (_.isUndefined(attachment)) {
              self.model.attachmentCollection.add(data);
            } else {
              attachment.set(data);
            }
          }, 'image/jpeg');
        }, {
          // TODO: make configurable
          maxWidth: 800,
          maxHeight: 800,
          canvas: true
        });
      }
    },

    onAddAttachment: function(attachment) {
      attachment.save();
      this.render();
    },

    onBinaryToggle: function(evt) {
      var self = this,
      category = this.model.get("location_type"),
      targetButton = $(evt.target).attr("id"),
      oldValue = $(evt.target).val(),
      // find the matching config data for this element
      selectedCategoryConfig = _.find(this.options.placeConfig.place_detail, function(categoryConfig) { return categoryConfig.category === category; }),
      altData = _.find(selectedCategoryConfig.fields, function(item) { return item.name === targetButton; }),
      // fetch alternate label and value
      altContent = _.find(altData.content, function(item) { return item.value != oldValue; });
      
      // set new value and label
      $(evt.target).val(altContent.value);
      $(evt.target).next("label").html(altContent.label);
    },

    onUpdateModel: function() {
      var self = this,
      // pull data off form and save model, triggering a PUT request
      attrs = _.extend(S.Util.getAttrs($("#update-place-model-form")), S.Util.getAttrs($("#update-place-model-title-form")));

      // special handling for binary toggle buttons: we need to remove
      // them completely from the model if they've been unselected in
      // the editor
      $('input[data-input-type="binary_toggle"]').each(function(input) {
        if (!$(this).is(":checked")) {
          self.model.unset($(this).attr("id"));
        }
      });

      this.model.save(attrs, {
        success: function() {
          self.isModified = false;
          self.isEditingToggled = false;
          self.render();
        },
        error: function() {
          // nothing
        }
      });
    },

    onHideModel: function() {
      var self = this;
      if (confirm("Are you sure you want to hide this post? It will no longer be visible on the map.")) { 
        this.model.save({"visible": false}, {
          success: function() {
            self.model.trigger("userHideModel", self.model);
          },
          error: function() {
            // nothing
          }
        });
      }
    }
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LandmarkDetailView = S.PlaceDetailView.extend({
    initialize: function() {
      var self = this;
      this.description = this.options.description;
      this.originalDescription = this.options.originalDescription;
      this.model = this.options.model;

      this.landmarkSurveyView = new S.LandmarkSurveyView({});
    },

    render: function() {
      var self = this,
          data = {
            description: this.description,
            story: this.model.attributes.story,
            title: this.model.attributes.title,
            fullTitle: this.model.attributes.fullTitle
          };

      // add the story navigation bar
      this.$el.html(Handlebars.templates['place-detail-story-bar'](data));
      this.$el.append((this.model.attributes.story) ? this.description : this.originalDescription);
      // Render the view as-is (collection may have content already)
      this.$('.survey').html(this.landmarkSurveyView.render().$el);

      // add the story navigation bar again, at the bottom of the view
      this.$el.append(Handlebars.templates['place-detail-story-bar-tagline'](data));

      this.delegateEvents();

      $("#content article").animate({ scrollTop: 0 }, "fast");

      return this;
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals _ Spinner Handlebars Backbone jQuery Gatekeeper */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceFormView = Backbone.View.extend({
    events: {
      'submit form': 'onSubmit',
      'change input[type="file"]': 'onInputFileChange',
      'click .category-btn.clickable + label': 'onCategoryChange',
      'click .category-menu-hamburger': 'onExpandCategories',
      'click input[data-input-type="binary_toggle"]': 'onBinaryToggle',
      'click .btn-geolocate': 'onClickGeolocate'
    },
    initialize: function(){
      var self = this;
       
      this.resetFormState();

      S.TemplateHelpers.overridePlaceTypeConfig(this.options.placeConfig.items,
        this.options.defaultPlaceTypeName);
      S.TemplateHelpers.insertInputTypeFlags(this.options.placeConfig.items);
    },
    resetFormState: function() {
      this.formState = {
        selectedCategory: null,
        selectedDatasetId: null,
        selectedDatasetSlug: null,
        isSingleCategory: false,
        attachmentData: null,
        placeDetail: this.options.placeConfig.place_detail
      }
    },
    render: function(category, isCategorySelected) {
      var self = this,
      selectedCategoryConfig = category && _.find(self.formState.placeDetail, function(categoryConfig) { return categoryConfig.category === category; }) || {},
      placesToIncludeOnForm = _.filter(self.formState.placeDetail, function(categoryConfig) { return categoryConfig.includeOnForm; });

      // if there is only one place to include on form, skip category selection page
      if (placesToIncludeOnForm.length === 1) {
        this.formState.isSingleCategory = true;
        isCategorySelected = true;
        category = placesToIncludeOnForm[0].category;
        this.formState.selectedCategory = category;
        this.formState.selectedDatasetId = placesToIncludeOnForm[0].dataset;
        this.formState.selectedDatasetSlug = _.find(this.options.mapConfig.layers, function(layer) { return self.formState.selectedDatasetId == layer.id }).slug;
        selectedCategoryConfig = placesToIncludeOnForm[0];
      }

      var data = _.extend({
        isCategorySelected: isCategorySelected,
        placeConfig: this.options.placeConfig,
        selectedCategory: selectedCategoryConfig,
        user_token: this.options.userToken,
        current_user: S.currentUser,
        isSingleCategory: this.formState.isSingleCategory
      }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['place-form'](data));

      if (this.center) $(".drag-marker-instructions").addClass("is-visuallyhidden");

      return this;
    },
    postRender: function() {
      // initialize datetime picker, if relevant
      $('#datetimepicker').datetimepicker({ formatTime: 'g:i a' }); // <-- add to datetimepicker, or could be a handlebars helper?
    },
    remove: function() {
      this.unbind();
    },
    onError: function(model, res) {
      // TODO handle model errors!
      console.log('oh no errors!!', model, res);
    },
    // This is called from the app view
    setLatLng: function(latLng) {
      this.center = latLng;
      this.$('.drag-marker-instructions, .drag-marker-warning').addClass('is-visuallyhidden');
    },
    setLocation: function(location) {
      this.location = location;
    },
    getAttrs: function() {
      var attrs = {},
          locationAttr = this.options.placeConfig.location_item_name,
          $form = this.$('form');

      // Get values from the form
      attrs = S.Util.getAttrs($form);

      // get values off of binary toggle buttons that have not been toggled
      $.each($("input[data-input-type='binary_toggle']:not(:checked)"), function() {
        attrs[$(this).attr("name")] = $(this).val();
      });

      // Get the location attributes from the map
      attrs.geometry = {
        type: 'Point',
        coordinates: [this.center.lng, this.center.lat]
      };

      if (this.location && locationAttr) {
        attrs[locationAttr] = this.location;
      }

      return attrs;
    },
    onCategoryChange: function(evt) {
      var self = this,
          animationDelay = 400;

      this.formState.selectedCategory = $(evt.target).parent().prev().attr('id');
      this.formState.selectedDatasetId = _.find(self.formState.placeDetail, function(categoryConfig) { return categoryConfig.category === self.formState.selectedCategory }).dataset;
      this.formState.selectedDatasetSlug = _.filter(this.options.mapConfig.layers, function(layer) { return layer.id === self.formState.selectedDatasetId })[0].slug;

      // re-render the form with the selected category
      this.render(this.formState.selectedCategory, true);
      // manually set the category button again since the re-render resets it
      $(evt.target).parent().prev().prop("checked", true);
      // hide and then show (with animation delay) the selected category button 
      // so we don't see a duplicate selected category button briefly
      $("#selected-category").hide().show(animationDelay);
      // slide up unused category buttons
      $("#category-btns").animate( { height: "hide" }, animationDelay );
      // if we've already dragged the map, make sure the map drag instructions don't reappear
      if (this.center) this.$('.drag-marker-instructions, .drag-marker-warning').addClass('is-visuallyhidden');
    },
    onClickGeolocate: function(evt) {
      var self = this;
      evt.preventDefault();
      var ll = this.options.appView.mapView.map.getBounds().toBBoxString();
      S.Util.log('USER', 'map', 'geolocate', ll, this.options.appView.mapView.map.getZoom());
      $("#drag-marker-content").addClass("is-visuallyhidden");
      $("#geolocating-msg").removeClass("is-visuallyhidden");

      this.options.appView.mapView.map.locate()
        .on("locationfound", function() { 
          self.center = self.options.appView.mapView.map.getCenter();
          $("#spotlight-place-mask").remove();
          $("#drag-marker-content").addClass("is-visuallyhidden");
        })
        .on("locationerror", function() {
          $("#drag-marker-content").removeClass("is-visuallyhidden");
          $("#geolocating-msg").addClass("is-visuallyhidden");
        });
    },
    onInputFileChange: function(evt) {
      var self = this,
          file,
          attachment;

      if(evt.target.files && evt.target.files.length) {
        file = evt.target.files[0];

        this.$('.fileinput-name').text(file.name);
        S.Util.fileToCanvas(file, function(canvas) {
          canvas.toBlob(function(blob) {
            self.formState.attachmentData = {
              name: $(evt.target).attr('name'),
              blob: blob,
              file: canvas.toDataURL('image/jpeg')
            }
          }, 'image/jpeg');
        }, {
          // TODO: make configurable
          maxWidth: 800,
          maxHeight: 800,
          canvas: true
        });
      }
    },
    onBinaryToggle: function(evt) {
      var self = this,
      targetButton = $(evt.target).attr("id"),
      oldValue = $(evt.target).val(),
      // find the matching config data for this element
      selectedCategoryConfig = _.find(this.formState.placeDetail, function(categoryConfig) { return categoryConfig.category === self.formState.selectedCategory; }),
      altData = _.find(selectedCategoryConfig.fields, function(item) { return item.name === targetButton; }),
      // fetch alternate label and value
      altContent = _.find(altData.content, function(item) { return item.value != oldValue; });

      // set new value and label
      $(evt.target).val(altContent.value);
      $(evt.target).next("label").html(altContent.label);
    },
    closePanel: function() {
      this.center = null;
      this.resetFormState();
    },
    onExpandCategories: function(evt) {
      var animationDelay = 400;
      $("#selected-category").hide(animationDelay);
      $("#category-btns").animate( { height: "show" }, animationDelay ); 
    },
    onSubmit: Gatekeeper.onValidSubmit(function(evt) {
      // Make sure that the center point has been set after the form was
      // rendered. If not, this is a good indication that the user neglected
      // to move the map to set it in the correct location.
      if (!this.center) {
        this.$('.drag-marker-instructions').addClass('is-visuallyhidden');
        this.$('.drag-marker-warning').removeClass('is-visuallyhidden');

        // Scroll to the top of the panel if desktop
        this.$el.parent('article').scrollTop(0);
        // Scroll to the top of the window, if mobile
        window.scrollTo(0, 0);
        return;
      }

      var self = this,
          router = this.options.router,
          collection = this.collection[self.formState.selectedDatasetId],
          model,
          // Should not include any files
          attrs = this.getAttrs(),
          $button = this.$('[name="save-place-btn"]'),
          spinner, $fileInputs;
      evt.preventDefault();

      collection.add({"location_type": this.formState.selectedCategory});
      model = collection.at(collection.length - 1);

      model.set("datasetSlug", self.formState.selectedDatasetSlug);
      model.set("datasetId", self.formState.selectedDatasetId);
      
      // if an attachment has been added...
      if (self.formState.attachmentData) {
        var attachment = model.attachmentCollection.find(function(attachmentModel) {
          return attachmentModel.get('name') === self.formState.attachmentData.name;
        });

        if (_.isUndefined(attachment)) {
          model.attachmentCollection.add(self.formState.attachmentData);
        } else {
          attachment.set(self.formState.attachmentData);
        }
      }

      $button.attr('disabled', 'disabled');
      spinner = new Spinner(S.smallSpinnerOptions).spin(self.$('.form-spinner')[0]);

      S.Util.log('USER', 'new-place', 'submit-place-btn-click');

      S.Util.setStickyFields(attrs, S.Config.survey.items, S.Config.place.items);

      // Save and redirect
      model.save(attrs, {
        success: function() {
          S.Util.log('USER', 'new-place', 'successfully-add-place');
          router.navigate('/'+ model.get('datasetSlug') + '/' + model.id, {trigger: true});
        },
        error: function() {
          S.Util.log('USER', 'new-place', 'fail-to-add-place');
        },
        complete: function() {
          $button.removeAttr('disabled');
          spinner.stop();
          self.resetFormState();
        },
        wait: true
      });
    })
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console) {
  // Handlebars support for Marionette
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  S.PlaceListItemView = Backbone.Marionette.Layout.extend({
    template: '#place-detail',
    tagName: 'li',
    className: 'clearfix',
    regions: {
      support: '.support'
    },
    modelEvents: {
      'show': 'show',
      'hide': 'hide',
      'change': 'render'
    },
    initialize: function() {
      var supportType = S.Config.support.submission_type;

      this.model.submissionSets[supportType] = this.model.submissionSets[supportType] ||
        new S.SubmissionCollection(null, {
          submissionType: supportType,
          placeModel: this.model
        });

      this.supportView = new S.SupportView({
        collection: this.model.submissionSets[S.Config.support.submission_type],
        supportConfig: S.Config.support,
        userToken: S.Config.userToken
      });
    },
    onBeforeRender: function() {
      // if an attachmentCollection has models in it, make sure the place
      // model's attachment attribute is set for the attachments to be
      // reliably rendered in the list view
      if (this.model.attachmentCollection.length > 0) {
        this.model.set("attachments", this.model.attachmentCollection.toJSON());
      }
    },
    onRender: function(evt) {
      this.support.show(this.supportView);
    },
    show: function() {
      this.$el.show();
    },
    hide: function() {
      this.$el.hide();
    }
  });

  S.PlaceListView = Backbone.Marionette.CompositeView.extend({
    template: '#place-list',
    itemView: S.PlaceListItemView,
    itemViewContainer: '.place-list',
    ui: {
      searchField: '#list-search',
      searchForm: '.list-search-form',
      allSorts: '.list-sort-menu a',
      date: '.date-sort',
      surveyCount: '.survey-sort',
      supportCount: '.support-sort'
    },
    events: {
      'input @ui.searchField': 'handleSearchInput',
      'submit @ui.searchForm': 'handleSearchSubmit',
      'click @ui.date': 'handleDateSort',
      'click @ui.surveyCount': 'handleSurveyCountSort',
      'click @ui.supportCount': 'handleSupportCountSort'
    },
    initialize: function(options) {
      var self = this;
      options = options || {};

      // This collection holds references to all place models
      // merged together, for sorting and filtering purposes
      this.collection = new S.PlaceCollection([]);

      _.each(this.options.placeCollections, function(collection) {
        collection.on("add", self.addModel, self);
        collection.on("sync", self.onSync, self);
      });

      // Init the views cache
      this.views = {};

      // Set the default sort
      this.sortBy = 'date';

      // Initialize the list filter
      this.collectionFilters = options.filter || {};
      this.searchTerm = options.term || '';
    },
    onSync: function() {
      // sort the merged collection after each component collection
      // is synced successfully
      this.sort();
    },
    onAfterItemAdded: function(view) {
      // Cache the views as they are added
      this.views[view.model.cid] = view;
    },
    addModel: function(model) {
      this.collection.add(model);
    },
    renderList: function() {
      var self = this;
      // A faster alternative to this._renderChildren. _renderChildren always
      // discards and recreates a new ItemView. This simply rerenders the
      // cached views.
      var $itemViewContainer = this.getItemViewContainer(this);
      $itemViewContainer.empty();

      this.collection.each(function(model) {
        if (self.views[model.cid]) {
          $itemViewContainer.append(self.views[model.cid].$el);
          // Delegate the events so that the subviews still work
          self.views[model.cid].supportView.delegateEvents();
        }
      });

      // remove story bars from the list view
      $("#list-container .place-story-bar").remove();
    },
    handleSearchInput: function(evt) {
      evt.preventDefault();
      this.search(this.ui.searchField.val());
    },
    handleSearchSubmit: function(evt) {
      evt.preventDefault();
      this.search(this.ui.searchField.val());
    },
    handleDateSort: function(evt) {
      evt.preventDefault();

      this.sortBy = 'date';
      this.sort();

      this.updateSortLinks();
    },
    handleSurveyCountSort: function(evt) {
      evt.preventDefault();

      this.sortBy = 'surveyCount';
      this.sort();

      this.updateSortLinks();
    },
    handleSupportCountSort: function(evt) {
      evt.preventDefault();

      this.sortBy = 'supportCount';
      this.sort();

      this.updateSortLinks();
    },
    updateSortLinks: function() {
      this.ui.allSorts.removeClass('is-selected');
      this.ui[this.sortBy].addClass('is-selected');
    },
    dateSort: function(a, b) {
      if (a.get('created_datetime') > b.get('created_datetime')) {
        return -1;
      } else {
        return 1;
      }
    },
    surveyCountSort: function(a, b) {
      var submissionA = a.submissionSets[S.Config.survey.submission_type],
          submissionB = b.submissionSets[S.Config.survey.submission_type],
          aCount = submissionA ? submissionA.size() : 0,
          bCount = submissionB ? submissionB.size() : 0;

      if (aCount === bCount) {
        if (a.get('created_datetime') > b.get('created_datetime')) {
          return -1;
        } else {
          return 1;
        }
      } else if (aCount > bCount) {
        return -1;
      } else {
        return 1;
      }
    },
    supportCountSort: function(a, b) {
      var submissionA = a.submissionSets[S.Config.support.submission_type],
          submissionB = b.submissionSets[S.Config.support.submission_type],
          aCount = submissionA ? submissionA.size() : 0,
          bCount = submissionB ? submissionB.size() : 0;

      if (aCount === bCount) {
        if (a.get('created_datetime') > b.get('created_datetime')) {
          return -1;
        } else {
          return 1;
        }
      } else if (aCount > bCount) {
        return -1;
      } else {
        return 1;
      }
    },
    sort: function() {
      var sortFunction = this.sortBy + 'Sort';

      this.collection.comparator = this[sortFunction];
      this.collection.sort();
      this.renderList();
      this.search(this.ui.searchField.val());
    },
    clearFilters: function() {
      this.collectionFilters = {};
      this.applyFilters(this.collectionFilters, this.searchTerm);
    },
    filter: function(filters) {
      _.extend(this.collectionFilters, filters);
      this.applyFilters(this.collectionFilters, this.searchTerm);
    },
    search: function(term) {
      this.searchTerm = term;
      this.applyFilters(this.collectionFilters, this.searchTerm);
    },
    applyFilters: function(filters, term) {
      var val, key, i;

      term = term.toUpperCase();
      this.collection.each(function(model) {
        var show = function() { model.trigger('show'); },
            hide = function() { model.trigger('hide'); },
            submitter, 
            locationType = model.get("location_type"),
            placeConfig = _.find(S.Config.place.place_detail, function(config) { return config.category === locationType });

        // If the model doesn't match one of the filters, hide it.
        for (key in filters) {
          val = filters[key];
          if (_.isFunction(val) && !val(model)) {
            return hide();
          }
          else if (!model.get(key) || val.toUpperCase() !== model.get(key).toUpperCase()) {
            return hide();
          }
        }

        // Check whether the remaining models match the search term
        for (var i = 0; i < placeConfig.fields.length; i++) { 
          key = placeConfig.fields[i].name;
          val = model.get(key);
          if (_.isString(val) && val.toUpperCase().indexOf(term) !== -1) {
            return show();
          }
        };

        // Submitter is only present when a user submits a place when logged in
        // with FB or Twitter. We handle it specially because it is an object,
        // not a string.
        submitter = model.get('submitter');
        if (!show && submitter) {
          if (submitter.name && submitter.name.toUpperCase().indexOf(term) !== -1 ||
              submitter.username && submitter.username.toUpperCase().indexOf(term) !== -1) {
            return show();
          }
        }

        // If the location_type has a label, we should search in it also.
        locationType = S.Config.flavor.place_types[model.get('location_type')];
        if (!show && locationType && locationType.label) {
          if (locationType.label.toUpperCase().indexOf(term) !== -1) {
            return show();
          }
        }

        // If we've fallen through here, hide the item.
        return hide();
      }, this);
    },
    isVisible: function() {
      return this.$el.is(':visible');
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

/* globals L Backbone _ */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.MapView = Backbone.View.extend({
    events: {
      'click .locate-me': 'onClickGeolocate'
    },
    initialize: function() {
      var self = this,
          i, layerModel,
          logUserZoom = function() {
            S.Util.log('USER', 'map', 'zoom', self.map.getBounds().toBBoxString(), self.map.getZoom());
          },
          logUserPan = function(evt) {
            S.Util.log('USER', 'map', 'drag', self.map.getBounds().toBBoxString(), self.map.getZoom());
          };

      this.map = L.map(self.el, self.options.mapConfig.options);

      _.each(self.options.mapConfig.layers, function(config) {
        config.loaded = false;
      });
      this.layers = {};
      this.layerViews = {};

      // bootstrapped data from page
      this.places = this.options.places;
      this.landmarks = this.options.landmarks;

      // Remove default prefix
      self.map.attributionControl.setPrefix('');

      // Init geolocation
      if (self.options.mapConfig.geolocation_enabled) {
        self.initGeolocation();
      }

      self.map.on('dragend', logUserPan);
      $(self.map.zoomControl._zoomInButton).click(logUserZoom);
      $(self.map.zoomControl._zoomOutButton).click(logUserZoom);

      self.map.on('zoomend', function(evt) {
        S.Util.log('APP', 'zoom', self.map.getZoom());
        $(S).trigger('zoomend', [evt]);
      });

      self.map.on('moveend', function(evt) {
        S.Util.log('APP', 'center-lat', self.map.getCenter().lat);
        S.Util.log('APP', 'center-lng', self.map.getCenter().lng);

        $(S).trigger('mapmoveend', [evt]);
      });

      self.map.on('dragend', function(evt) {
        $(S).trigger('mapdragend', [evt]);
      });

      // Bind shareabouts collections event listeners
      _.each(self.places, function(collection, collectionId) {
        self.layers[collectionId] = self.getLayerGroups();
        self.layerViews[collectionId] = {};
        collection.on('reset', self.render, self);
        collection.on('add', self.addLayerView(collectionId), self);
        collection.on('remove', self.removeLayerView(collectionId), self);
        collection.on('userHideModel', self.onUserHideModel(collectionId), self);
      });

      // Bind landmark collections event listeners
      _.each(self.landmarks, function(collection, collectionId) {
        self.layers[collectionId] = L.layerGroup();
        self.layerViews[collectionId] = {};
        collection.on('add', self.addLandmarkLayerView(collectionId), self);
        collection.on('remove', self.removeLandmarkLayerView(collectionId), self);
      });

      // Bind visiblity event for custom layers
      $(S).on('visibility', function (evt, id, visible, isBasemap) {
        var layer = self.layers[id],
        config = _.find(self.options.mapConfig.layers, function(c) {
          return c.id === id;
        });
        if (config && !config.loaded && visible) {
          self.createLayerFromConfig(config);
          config.loaded = true;
          layer = self.layers[id];
        }
        if (isBasemap) {
          _.each(self.options.basemapConfigs, function(basemap) {
            if (basemap.id === id) {
              self.map.addLayer(layer);
              layer.bringToBack();
            } else if (self.layers[basemap.id]) {
              self.map.removeLayer(self.layers[basemap.id]);
            }
          });
        } else if (layer) {
          self.setLayerVisibility(layer, visible);
        } else {
          // Handles cases when we fire events for layers that are not yet
          // loaded (ie cartodb layers, which are loaded asynchronously)
          // We are setting the asynch layer config's default visibility here to
          // ensure they are added to the map when they are eventually loaded:
          config.asyncLayerVisibleDefault = visible;
        }
      });
    }, // end initialize

    onUserHideModel: function(collectionId) {
      return function(model) {
        this.options.placeDetailViews[model.cid].remove();
        delete this.options.placeDetailViews[model.cid];
        this.places[collectionId].remove(model);
        S.Util.log('APP', 'panel-state', 'closed');
        // remove map mask if the user closes the side panel
        $("#spotlight-place-mask").remove();
        if (this.locationTypeFilter) {
          this.options.router.navigate('filter/' + this.locationTypeFilter, {trigger: true});
        } else {
          this.options.router.navigate('/', {trigger: true});
        }
      }
    },

    // Adds or removes the layer  on Master Layer based on visibility
    setLayerVisibility: function(layer, visible) {
      this.map.closePopup();
      if (visible && !this.map.hasLayer(layer)) {
        this.map.addLayer(layer);
      }
      if (!visible && this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    },
    reverseGeocodeMapCenter: _.debounce(function() {
      var center = this.map.getCenter();
      S.Util.MapQuest.reverseGeocode(center, {
        success: function(data) {
          var locationsData = data.results[0].locations;
          // S.Util.console.log('Reverse geocoded center: ', data);
          $(S).trigger('reversegeocode', [locationsData[0]]);
        }
      });
    }, 1000),
    initGeolocation: function() {
      var self = this;

      var onLocationError = function(evt) {
        var message;
        switch (evt.code) {
          // Unknown
          case 0:
            message = 'An unknown error occured while locating your position. Please try again.';
            break;
          // Permission Denied
          case 1:
            message = 'Geolocation is disabled for this page. Please adjust your browser settings.';
            break;
          // Position Unavailable
          case 2:
            message = 'Your location could not be determined. Please try again.';
            break;
          // Timeout
          case 3:
            message = 'It took too long to determine your location. Please try again.';
            break;
        }
        alert(message);
      };
      var onLocationFound = function(evt) {
        var msg;
        if(!self.map.options.maxBounds ||self.map.options.maxBounds.contains(evt.latlng)) {
          self.map.fitBounds(evt.bounds);
        } else {
          msg = 'It looks like you\'re not in a place where we\'re collecting ' +
            'data. I\'m going to leave the map where it is, okay?';
          alert(msg);
        }
      };
      // Add the geolocation control link
      this.$('.leaflet-top.leaflet-right').append(
        '<div class="leaflet-control leaflet-bar">' +
          '<a href="#" class="locate-me"></a>' +
        '</div>'
      );

      // Bind event handling
      this.map.on('locationerror', onLocationError);
      this.map.on('locationfound', onLocationFound);

      // Go to the current location if specified
      if (this.options.mapConfig.geolocation_onload) {
        this.geolocate();
      }
    },
    onClickGeolocate: function(evt) {
      evt.preventDefault();
      S.Util.log('USER', 'map', 'geolocate', this.map.getBounds().toBBoxString(), this.map.getZoom());
      this.geolocate();
    },
    geolocate: function() {
      this.map.locate();
    },
    addLandmarkLayerView: function(collectionId) {
      return function(model) {
        this.layerViews[collectionId][model.id] = new S.BasicLayerView({
          model: model,
          router: this.options.router,
          map: this.map,
          placeTypes: this.options.placeTypes,
          collectionId: collectionId,
          layer: this.layers[collectionId],
          // to access the filter
          mapView: this
        });
      }
    },
    removeLandmarkLayerView: function(collectionId) {
      return function(model) {
        this.layerViews[collectionId][model.id].remove();
        delete this.layerViews[collectionId][model.id];
      }
    },
    addLayerView: function(collectionId) {
      return function(model) {
        this.layerViews[collectionId][model.cid] = new S.LayerView({
          model: model,
          router: this.options.router,
          map: this.map,
          layer: this.layers[collectionId],
          placeTypes: this.options.placeTypes,
          // to access the filter
          mapView: this
        });
      }
    },
    removeLayerView: function(collectionId) {
      return function(model) {
        this.layerViews[collectionId][model.cid].remove();
        delete this.layerViews[collectionId][model.cid];
      }
    },
    zoomInOn: function(latLng) {
      this.map.setView(latLng, this.options.mapConfig.options.maxZoom || 17);
    },

    filter: function(locationType) {
      var self = this;
      this.locationTypeFilter = locationType;
      this.collection.each(function(model) {
        var modelLocationType = model.get('location_type');

        if (modelLocationType &&
          modelLocationType.toUpperCase() === locationType.toUpperCase()) {
          self.layerViews[model.cid].show();
        } else {
          self.layerViews[model.cid].hide();
        }
      });

      _.each(Object.keys(self.landmarks), function(collectionId) {
        self.landmarks[collectionId].each(function(model) {
          var modelLocationType = model.get('location_type');

          if (modelLocationType &&
              modelLocationType.toUpperCase() === locationType.toUpperCase()) {
            self.layerViews[collectionId][model.id].show();
          } else {
            self.layerViews[collectionId][model.id].hide();
          }
        });
      });
    },
    clearFilter: function(collectionId) {
      var self = this;
      this.locationTypeFilter = null;
      _.each(this.places, function(collection) {
        collection.each(function(model) {
          if (self.layerViews[model.cid]) { self.layerViews[model.cid].render(); }
        });
      });

      _.each(this.landmarks, function(collection) {
        collection.each(function(model) {
          if (self.layerViews[model.cid]) { self.layerViews[model.cid].render(); }
        });
      });
    },
    getLayerGroups: function() {
      var self = this;
      var clusterOptions = self.options.cluster;
      if (!clusterOptions) {
        return L.layerGroup();
      } else {
        return L.markerClusterGroup({
          iconCreateFunction: function(cluster) {
            var markers = cluster.getAllChildMarkers();
            var n = markers.length;
            var small = n < clusterOptions.threshold;
            var className = small ? clusterOptions.class_small: clusterOptions.class_large;
            var size = small ? clusterOptions.size_small : clusterOptions.size_large;
            return L.divIcon({ html: n, className: className, iconSize: [size, size] });
          }
        });
      }
    },
    createLayerFromConfig: function(config) {
      var self = this,
          layer,
          collectionId,
          collection;
      if (config.type && config.type === 'json') {
        var url = config.url;
        if (config.sources) {
          url += '?';
          config.sources.forEach(function (source) {
            url += encodeURIComponent(source) + '&';
          });
        }
        layer = L.argo(url, config);
        self.layers[config.id] = layer;
      } else if (config.type && config.type === 'esri-feature') {
        if (config.loadStrategy === 'all at once') {
          // IDs can be returned all at once, while actual geometries are
          // capped at 1000 per request. Gets an array of all IDs then
          // requests their geometry 1000 at a time.
          L.esri.Tasks.query({
            url: config.url
          }).ids(function(error, ids) {
            var esriLayers = [];

            for (var i = 0; i < ids.length; i += 1000) {
              L.esri.Tasks.query({url: config.url})
                .featureIds(ids.slice(i, i + 1000))
                .run(function(error, geoJson) {
                  var currentLayer = L.argo(geoJson, config);

                  if (config.popupContent) {
                    curentLayer.bindPopup(function(feature) {
                      return L.Argo.t(config.popupContent, feature.properties);
                    });
                  }

                  esriLayers.push(currentLayer);

                  if (esriLayers.length === (Math.floor(ids.length / 1000) + 1)) {
                    // All requests have completed
                    self.layers[config.id] = L.layerGroup(esriLayers);
                  }
                });
            }
          });
        } else {
          layer = L.esri.featureLayer(
            {
              url: config.url,
              style: function(feature) {
                return L.Argo.getStyleRule(feature, config.rules)['style'];
              }
            }
          );

          if (config.popupContent) {
            layer.bindPopup(function(feature) {
              return L.Argo.t(config.popupContent, feature.properties);
            });
          }

          self.layers[config.id] = layer;
        }
      } else if (config.type && config.type === 'place') {
        // NOTE: Since places and landmarks have their own url's, loading them
        // into our map is handled in our Backbone router.
        // nothing to do
      } else if (config.type && config.type === 'landmark') {
        // NOTE: Since places and landmarks have their own url's, loading them
        // into our map is handled in our Backbone router.
        // nothing to do
      } else if (config.type && config.type === 'cartodb') {
        cartodb.createLayer(self.map, config.url, { legends: false })
          .on('done', function(cartoLayer) {
            self.layers[config.id] = cartoLayer;
            // This is only set when the 'visibility' event is fired before
            // our carto layer is loaded:
            if (config.asyncLayerVisibleDefault) {
              cartoLayer.addTo(self.map);
            }
          })
          .on('error', function(err) {
            S.Util.log('Cartodb layer creation error:', err);
          });
      } else if (config.layers) {
        // If "layers" is present, then we assume that the config
        // references a Leaflet WMS layer.
        // http://leafletjs.com/reference.html#tilelayer-wms
        layer = L.tileLayer.wms(config.url, {
          layers: config.layers,
          format: config.format,
          transparent: config.transparent,
          version: config.version,
          crs: L.CRS.EPSG3857,
          // default TileLayer options
          attribution: config.attribution,
          opacity: config.opacity,
          fillColor: config.color,
          weight: config.weight,
          fillOpacity: config.fillOpacity
        });
        self.layers[config.id] = layer;
      } else {
        // Assume a tile layer
        // TODO: Isn't type=tile for back compatibility
        layer = L.tileLayer(config.url, config);
        self.layers[config.id] = layer;
      }
    }
  });

})(Shareabouts, jQuery, Shareabouts.Util.console);

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LegendView = Backbone.View.extend({

    render: function() {
      var self = this,
          data = _.extend({
            items: this.options.config.items
          }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['legend'](data));

      return this;
    }
  });
})(Shareabouts, jQuery, Shareabouts.Util.console);

// leaflet-sidebar-view: GIS: needs layers, not reports
var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.GISLegendView = Backbone.View.extend({
    events: {
      'change .map-legend-basemap-radio': 'toggleBasemap',
      'change .map-legend-checkbox': 'toggleVisibility',
      'change .map-legend-grouping-checkbox': 'toggleHeaderVisibility'
    },

    render: function() {
      var self = this,
          data = _.extend({
            basemaps: this.options.config.basemaps,
            groupings: this.options.config.groupings
          }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['gis-legend-content'](data));

      _.each(this.options.config.groupings, function(group) {
        _.each(group.layers, function(layer) {
          $(S).trigger('visibility', [layer.id, !!layer.visibleDefault]);
        });
      });

      var initialBasemap = _.find(this.options.config.basemaps, function(basemap) {
                               return !!basemap.visibleDefault;
                             });

      $(S).trigger('visibility', [initialBasemap.id, !!initialBasemap.visibleDefault, true]);

      return this;
    },

    // Checkbox change handler, triggers event to the MapView
    toggleVisibility: function(evt) {
      var $cbox = $(evt.target),
          id = $cbox.attr('data-layerid'),
          isChecked = !!$cbox.is(':checked');

      $(S).trigger('visibility', [id, isChecked]);
    },

    toggleBasemap: function(evt) {
      var radio = $(evt.target),
          id = radio.attr('data-layerid'),
          isChecked = !!radio.is(':checked'),
          basemaps = this.options.config.basemaps;

      $(S).trigger('visibility', [id, isChecked, true]);
    },

    // Toggles visibility of layers based on header checkbox
    toggleHeaderVisibility: function(evt) {
      var $groupbox = $(evt.target),
           groupid = $groupbox.attr("id"),
           isChecked = $groupbox.is(":checked"),
           group = _.find(this.options.config.groupings, function(group) {
                     return group.id === groupid;
                   });

      for (i = 0; i < group.layers.length; i++) {
        var layer = group.layers[i];
        $(S).trigger("visibility", [layer.id, isChecked]);
        $("#map-" + layer.id).prop("checked", isChecked);
      }
    }

  });
})(Shareabouts, jQuery, Shareabouts.Util.console);

/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.SidebarView = Backbone.View.extend({
    initialize: function() {
      var self = this;

    },

    render: function() {
      var self = this,
          data = {
            config: this.options.sidebarConfig
          };

      this.$el.html(Handlebars.templates['sidebar'](data));

      _.each(this.options.sidebarConfig.panels, function(panelConfig) {
        // TODO: Generalize this for views rendered outside of the sidebar:
        // (or for views with more complicated dependencies like ActivityView)
        if (panelConfig.id != 'ticker') {
          (new S[panelConfig.view]({
            el: '#' + panelConfig.id,
            mapView: self.options.mapView,
            config: panelConfig
          })).render();
        }
      });

      self.sidebar = L.control.sidebar('sidebar', {
        position: 'left'
      });
      self.sidebar.addTo(this.options.mapView);
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));

/*globals Backbone jQuery _ */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.App = Backbone.Router.extend({
    routes: {
      '': 'viewMap',
      'filter/:locationtype': 'filterMap',
      'page/:slug': 'viewPage',
      ':dataset/:id': 'viewPlace',
      'new': 'newPlace',
      ':dataset/:id/response/:response_id': 'viewPlace',
      ':dataset/:id/edit': 'editPlace',
      'list': 'showList',
      ':id': 'viewLandmark',
      ':zoom/:lat/:lng': 'viewMap'
    },

    initialize: function(options) {
      var self = this,
          startPageConfig,
          filteredRoutes,
          // store config details for places and landmarks
          configArrays = {};

      // store individual place collections for each place type
      this.places = {};
      // store individual activity collections for each place type
      this.activities = {};
      // store individual landmark collections for each landmark type
      this.landmarks = {};

      S.PlaceModel.prototype.getLoggingDetails = function() {
        return this.id;
      };
      S.LandmarkModel.prototype.getLoggingDetails = function() {
        return this.id;
      };

      // Reject a place that does not have a supported location type. This will
      // prevent invalid places from being added or saved to the collection.
      S.PlaceModel.prototype.validate = function(attrs, options) {
        var locationType = attrs.location_type,
            locationTypes = _.map(S.Config.placeTypes, function(config, key){ return key; });

        if (!_.contains(locationTypes, locationType)) {
          console.warn(locationType + ' is not supported.');
          return locationType + ' is not supported.';
        }
      };

      // Global route changes
      this.bind('route', function(route, router) {
        S.Util.log('ROUTE', self.getCurrentPath());
      });

      filteredRoutes = this.getFilteredRoutes();
      this.bind('route', function(route) {
        // If the route shouldn't be filtered, then clear the filter. Otherwise
        // leave it alone.
        if (!_.contains(filteredRoutes, route)) {
          this.clearLocationTypeFilter();
        }
      }, this);

      this.loading = true;

      // set up landmark configs and instantiate landmark collections
      configArrays.landmarks = options.mapConfig.layers.filter(function(layer) {
        return layer.type && layer.type === 'landmark';
      });
      _.each(configArrays.landmarks, function(config) {
        var url = config.url + "?"
        config.sources.forEach(function (source) {
          url += encodeURIComponent(source) + '&'
        });
        var collection = new S.LandmarkCollection([], { url: url });
        self.landmarks[config.id] = collection;
      });

      // set up place configs and instantiate place collections
      configArrays.places = options.mapConfig.layers.filter(function(layer) {
        return layer.type && layer.type === 'place';
      });
      _.each(configArrays.places, function(config) {
        var collection = new S.PlaceCollection([], { url: "/dataset/" + config.id + "/places" });
        self.places[config.id] = collection;
      });

      // instantiate action collections for shareabouts places
      _.each(configArrays.places, function(config) {
        var collection = new S.ActionCollection([], { url: "/dataset/" + config.id + "/actions" });
        self.activities[config.id] = collection;
      });

      this.appView = new S.AppView({
        el: 'body',
        activities: this.activities,
        places: this.places,
        landmarks: this.landmarks,
        datasetConfigs: configArrays,
        config: options.config,
        defaultPlaceTypeName: options.defaultPlaceTypeName,
        placeTypes: options.placeTypes,
        cluster: options.cluster,
        surveyConfig: options.surveyConfig,
        supportConfig: options.supportConfig,
        pagesConfig: options.pagesConfig,
        mapConfig: options.mapConfig,
        storyConfig: options.storyConfig,
        placeConfig: options.placeConfig,
        sidebarConfig: options.sidebarConfig,
        activityConfig: options.activityConfig,
        userToken: options.userToken,
        router: this
      });

      // Start tracking the history
      var historyOptions = {pushState: true};
      if (options.defaultPlaceTypeName) {
        historyOptions.root = '/' + options.defaultPlaceTypeName + '/';
      }

      Backbone.history.start(historyOptions);

      // Load the default page when there is no page already in the url
      if (Backbone.history.getFragment() === '') {
        startPageConfig = S.Util.findPageConfig(options.pagesConfig, {start_page: true});

        if (startPageConfig && startPageConfig.slug) {
          this.navigate('page/' + startPageConfig.slug, {trigger: true});
        }
      }

      this.loading = false;
    },

    getCurrentPath: function() {
      var root = Backbone.history.root,
          fragment = Backbone.history.fragment;
      return root + fragment;
    },

    viewMap: function(zoom, lat, lng) {
      if (this.appView.mapView.locationTypeFilter) {
        // If there's a filter applied, actually go to that filtered route.
        this.navigate('/filter/' + this.appView.mapView.locationTypeFilter, {trigger: false});
      }

      this.appView.viewMap(zoom, lat, lng);
      this.appView.mapView.clearFilter();
    },

    newPlace: function() {
      this.appView.newPlace();
    },

    viewLandmark: function(id) {
      this.appView.viewLandmark(id, { zoom: this.loading });
    },

    viewPlace: function(datasetSlug, id, responseId) {
      this.appView.viewPlace(datasetSlug, id, responseId, this.loading);
    },

    editPlace: function(){},

    viewPage: function(slug) {
      this.appView.viewPage(slug);
    },

    showList: function() {
      this.appView.showListView();
    },

    isMapRoute: function(fragment) {
      // This is a little hacky. I attempted to use Backbone.history.handlers,
      // but there is currently no way to map the route, at this point
      // transformed into a regex, back to the route name. This may change
      // in the future.
      return (fragment === '' || (fragment.indexOf('place') === -1 &&
                                  fragment.indexOf('page') === -1 &&
                                  fragment.indexOf('list') === -1));
    },

    getFilteredRoutes: function() {
      return ['filterMap', 'viewPlace', 'showList', 'viewMap'];
    },

    clearLocationTypeFilter: function() {
      this.setLocationTypeFilter('all');
    },

    setLocationTypeFilter: function(locationType) {
      // TODO: This functionality should be moved in to the app-view
      var $filterIndicator = $('#current-filter-type');
      if ($filterIndicator.length === 0) {
        $filterIndicator = $('<div id="current-filter-type"/>')
          .insertAfter($('.menu-item-filter-type > a:first-child'));
      }

      // Get the menu information for the current location type
      var filterMenu, menuItem;
      if (S.Config.pages) {
        filterMenu = _.findWhere(S.Config.pages, {'slug': 'filter-type'});
      }
      if (filterMenu) {
        menuItem = _.findWhere(filterMenu.pages, {'url': '/filter/' + locationType});
      }

      if (locationType !== 'all') {
        this.appView.mapView.filter(locationType);
        if (this.appView.listView) {
          this.appView.listView.filter({'location_type': locationType});
        }

        // Show the menu item title with the coresponding style
        if (menuItem) {
          $filterIndicator
            .removeClass()
            .addClass(locationType)
            .html(menuItem.title);
        }

      } else {
        // If the filter is 'all', we're unsetting the filter.
        this.appView.mapView.clearFilter();
        if (this.appView.listView) {
          this.appView.listView.clearFilters();
        }

        $filterIndicator
          .removeClass()
          .addClass('unfiltered')
          .empty();
      }
    },

    filterMap: function(locationType) {
      this.setLocationTypeFilter(locationType);
      if (locationType === 'all') {
        if (this.appView.listView && this.appView.listView.isVisible()) {
          this.navigate('/list', {trigger: false});
        } else {
          this.navigate('/', {trigger: false});
        }
      }
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));
