  var Util = require('../utils.js');

  var SupportView = require('mapseed-support-view');

  var SubmissionCollection = require('../models/submission-collection.js');
  var PlaceCollection = require('../models/place-collection.js');

  // Handlebars support for Marionette
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  var PlaceListItemView = Backbone.Marionette.Layout.extend({
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
      var supportType = Shareabouts.Config.support.submission_type;

      this.model.submissionSets[supportType] = this.model.submissionSets[supportType] ||
        new SubmissionCollection(null, {
          submissionType: supportType,
          placeModel: this.model
        });

      this.supportView = new SupportView({
        collection: this.model.submissionSets[Shareabouts.Config.support.submission_type],
        supportConfig: Shareabouts.Config.support,
        userToken: Shareabouts.Config.userToken
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
      this.support.reset();
      this.support.show(this.supportView);
      
      // in case story mode has hidden the title or inserted navigation bars
      if (this.model.get("story")) {
        this.$el.find(".place-header-title").removeClass("is-visuallyhidden");
        this.$el.find(".place-story-bar").remove();
      }
    },
    show: function() {
      this.$el.show();
    },
    hide: function() {
      this.$el.hide();
    }
  });

  module.exports = Backbone.Marionette.CompositeView.extend({
    template: '#place-list',
    itemView: PlaceListItemView,
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
      'click @ui.supportCount': 'handleSupportCountSort',
      'scroll': 'infiniteScroll'
    },
    initialize: function(options) {
      var self = this;
      options = options || {};

      // This collection holds references to all place models
      // merged together, for sorting and filtering purposes
      this.collection = new PlaceCollection([]);

      this.unrenderedItems = new PlaceCollection([]);

      _.each(this.options.placeCollections, function(collection) {
        collection.on("add", self.addModel, self);
      });

      this.itemsPerPage = 10;
      this.numItemsShown = this.itemsPerPage;

      // Init the views cache
      this.views = {};

      // Set the default sort
      this.sortBy = 'date';

      // Initialize the list filter
      this.collectionFilters = options.filter || {};
      this.searchTerm = options.term || '';
    },
    onAfterItemAdded: function(view) {
      // Cache the views as they are added
      this.views[view.model.cid] = view;
    },
    addModel: function(model) {
      if (this.collection.length < this.numItemsShown) {
        this.collection.add(model, {sort: false});
      } else {
        this.unrenderedItems.add(model, {sort: false});
      }
    },
    renderList: function() {
      var self = this;
      // A faster alternative to this._renderChildren. _renderChildren always
      // discards and recreates a new ItemView. This simply rerenders the
      // cached views.
      var $itemViewContainer = this.getItemViewContainer(this);
      $itemViewContainer.empty();

      this.collection.each(function(model, index) {
        if (self.views[model.cid] && index < self.numItemsShown) {
          $itemViewContainer.append(self.views[model.cid].$el);
          // Delegate the events so that the subviews still work
          self.views[model.cid].supportView.delegateEvents();
        }
      });
    },
    infiniteScroll: function() {
      var totalHeight = this.$('> ul').height();
      var scrollTop = this.$el.scrollTop() + this.$el.height();
      // 200 = number of pixels from bottom to load more
      if (scrollTop + 200 >= totalHeight) {
        this.numItemsShown += this.itemsPerPage;
        this.applyFilters(this.collectionFilters, this.searchTerm, this.numItemsShown);
      }
    },
    infiniteScroll: function() {
      var totalHeight = this.$('> ul').height();
      var scrollTop = this.$el.scrollTop() + this.$el.height();
      // 200 = number of pixels from bottom to load more
      if (scrollTop + 200 >= totalHeight) {
        this.numItemsShown += this.itemsPerPage;
        this.applyFilters(this.collectionFilters, this.searchTerm, this.numItemsShown);
      }
    },
    handleSearchInput: function(evt) {
      evt.preventDefault();
      this.numItemsShown = this.itemsPerPage;
      this.search(this.ui.searchField.val());
    },
    handleSearchSubmit: function(evt) {
      evt.preventDefault();
      this.numItemsShown = this.itemsPerPage;
      this.search(this.ui.searchField.val());
    },
    handleDateSort: function(evt) {
      evt.preventDefault();
      this.numItemsShown = this.itemsPerPage;
      this.sortBy = 'date';
      this.sort();

      this.updateSortLinks();
    },
    handleSurveyCountSort: function(evt) {
      evt.preventDefault();
      this.numItemsShown = this.itemsPerPage;
      this.sortBy = 'surveyCount';
      this.sort();

      this.updateSortLinks();
    },
    handleSupportCountSort: function(evt) {
      evt.preventDefault();
      this.numItemsShown = this.itemsPerPage;
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
      var submissionA = a.submissionSets[Shareabouts.Config.survey.submission_type],
          submissionB = b.submissionSets[Shareabouts.Config.survey.submission_type],
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
      var submissionA = a.submissionSets[Shareabouts.Config.support.submission_type],
          submissionB = b.submissionSets[Shareabouts.Config.support.submission_type],
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
      this.unrenderedItems.comparator = this[sortFunction];
      this.collection.sort();
      this.unrenderedItems.sort();
      this.renderList();
      this.search(this.ui.searchField.val());
    },
    clearFilters: function() {
      this.collectionFilters = {};
      this.applyFilters(this.collectionFilters, this.searchTerm, this.numItemsShown);
    },
    filter: function(filters) {
      _.extend(this.collectionFilters, filters);
      this.applyFilters(this.collectionFilters, this.searchTerm, this.numItemsShown);
    },
    search: function(term) {
      this.searchTerm = term;
      this.applyFilters(this.collectionFilters, this.searchTerm, this.numItemsShown);
    },
    applyFilters: function(filters, term, max) {
      var val, key, i, 
          previouslyUnrenderedModels = [];

      term = term.toUpperCase();

      this.unrenderedItems.add(this.collection.models);
      this.collection.reset();

      this.unrenderedItems.each(function(model, index) {
        if (index > max) {
          return;
        }

        var submitter,
            locationType = model.get("location_type"),
            placeConfig = _.find(Shareabouts.Config.place.place_detail, function(config) { return config.category === locationType });

        // Check whether the remaining models match the search term
        for (var i = 0; i < placeConfig.fields.length; i++) {
          key = placeConfig.fields[i].name;
          val = model.get(key);
          if (_.isString(val) && val.toUpperCase().indexOf(term) !== -1) {
            previouslyUnrenderedModels.push(model);
            return this.collection.add(model);
          }
        };

        // Submitter is only present when a user submits a place when logged in
        // with FB or Twitter. We handle it specially because it is an object,
        // not a string.
        submitter = model.get('submitter');
        if (submitter) {
          if (submitter.name && submitter.name.toUpperCase().indexOf(term) !== -1 ||
              submitter.username && submitter.username.toUpperCase().indexOf(term) !== -1) {
            previouslyUnrenderedModels.push(model);
            return this.collection.add(model);
          }
        }

        // If the location_type has a label, we should search in it also.
        locationType = Shareabouts.Config.flavor.place_types[model.get('location_type')];
        if (locationType && locationType.label) {
          if (locationType.label.toUpperCase().indexOf(term) !== -1) {
            previouslyUnrenderedModels.push(model);
            return this.collection.add(model);
          }
        }
      }, this);

      previouslyUnrenderedModels.forEach(function(model) {
        this.unrenderedItems.remove(model);
      }, this);
    },
    isVisible: function() {
      return this.$el.is(':visible');
    }
  });
