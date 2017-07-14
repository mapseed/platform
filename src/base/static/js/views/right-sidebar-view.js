var Util = require("../utils.js");

var StoryCollection = require("../models/story-collection.js");

// A view for managing individual story items
var SidebarStoryItemView = Backbone.Marionette.ItemView.extend({
  template: "#sidebar-story-detail",
  tagName: "li",
  className: "sidebar-story-item",
  events: {
    click: "onClickThisItem",
  },

  serializeData: function() {
    var data = this.model.toJSON();
    _.extend(data, {
      iconUrl: this.iconUrl,
    });

    return data;
  },

  onClickThisItem: function(evt) {
    this.options.router.navigate(this.url, { trigger: true });
  },

  onBeforeRender: function() {
    this.url = Util.getUrl(this.model);

    // If the story config for this place declares an explicit sidebar icon url,
    // use that icon
    if (
      this.options.storyConfig[this.options.sidebarStoryView.collectionName]
        .order[this.url].sidebarIconUrl
    ) {
      this.iconUrl = this.options.storyConfig[
        this.options.sidebarStoryView.collectionName
      ].order[this.url].sidebarIconUrl;
      return;
    }

    // Try to find the icon for a landmark layer
    this.layerView = this.options.layerViews[this.model.get("datasetId")][
      this.model.get("id")
    ];

    // Try to find the icon for a place layer
    if (!this.layerView) {
      this.layerView = this.options.layerViews[this.model.get("datasetId")][
        this.model.cid
      ];
    }

    var categoryConfig = _.find(
      this.options.placeConfig.place_detail,
      function(config) {
        return config.category === this.model.get("location_type");
      },
      this,
    );

    if (
      categoryConfig &&
      this.layerView &&
      this.layerView.layer instanceof L.Marker
    ) {
      this.iconUrl = categoryConfig.icon_url;
    } else {
      // Otherwise, supply a default icon (for polygon geometry, etc.)
      this.iconUrl = "/static/css/images/markers/map-pin-marker.png";
    }
  },

  onRender: function(evt) {
    var self = this;

    if (Backbone.history.getFragment() === this.url) {
      this.$el.addClass("story-selected");
      this.options.sidebarStoryView.storyItemSelected = true;
    }

    // Listen to route changes and update sidebar styling accordingly
    this.options.router.on("route", function(fn, route) {
      route = route.join("/");

      if (route === self.url) {
        self.$el.addClass("story-selected");
        self.options.sidebarStoryView.storyItemSelected = true;
      } else {
        self.$el.removeClass("story-selected");
      }
    });
  },
});

// A view for managing a collection of story items in a right sidebar panel
var SidebarStoryCollectionView = Backbone.Marionette.CollectionView.extend({
  itemView: SidebarStoryItemView,
  initialize: function() {
    var self = this;

    this.itemViewOptions = {
      layerViews: this.options.layerViews,
      placeConfig: this.options.placeConfig,
      router: this.options.router,
      sidebarStoryView: this,
      storyConfig: this.options.storyConfig,
    };
    this.storyItemSelected = false;

    new Spinner(Shareabouts.smallSpinnerOptions).spin(
      $("#right-sidebar-container #right-sidebar-spinner")[0],
    );

    this.places = this.options.appView.places;
    this.landmarks = this.options.appView.landmarks;
    this.storyCollections = {};

    // Wait to initialize the sidebar until all collections have loaded
    $.when
      .apply($, Shareabouts.deferredCollections)
      .then(function() {
        // Build a series of StoryCollections containing references to landmark
        // and place models in each configured story
        _.each(self.options.storyConfig, function(story, title) {
          self.storyCollections[title] = new StoryCollection([]);
          _.each(story.order, function(value, name) {
            self.storyCollections[title].add(self.findModelByUrl(name));
          });
        });

        // If we're loading the page directly to a place or landmark, check if that
        // url is part of a story. If not, show default story content.
        self.collectionName = self.searchStoryCollections(
          Backbone.history.getFragment().split("/"),
        );
        if (self.collectionName) {
          self.collection = self.storyCollections[self.collectionName];
        } else {
          self.collection =
            self.storyCollections[Object.keys(self.storyCollections)[0]];
          self.collectionName = Object.keys(self.storyCollections)[0];
        }

        self.render();
        $("#right-sidebar-container #right-sidebar-spinner").remove();

        // On route changes, check if we've loaded a place or landmark that's
        // part of a story. If so, load the story elements for that story in the
        // sidebar.
        self.options.router.on("route", function(fn, route) {
          self.collectionName = self.searchStoryCollections(route);
          if (self.collectionName) {
            $("body").addClass("right-sidebar-visible");
            self.collection = self.storyCollections[self.collectionName];
            self.render();
          }
        });
      })
      .fail(function(a) {
        // If one or more of the Promises passed to $.when fail, then the
        // master deferred object will fail, and the sidebar will hang. In this
        // case, display an error message.
        $("#right-sidebar-spinner")
          .html("Error loading one or more datasets")
          .addClass("sidebar-error");
      });
  },

  searchStoryCollections: function(url) {
    var foundCollectionName;

    _.each(this.storyCollections, function(storyCollection, name) {
      if (url.length === 1 && !foundCollectionName) {
        if (
          storyCollection.get(url[0]) ||
          storyCollection.findWhere({ "url-title": url[0] })
        ) {
          foundCollectionName = name;
        }
      } else if (
        url.length === 2 &&
        !foundCollectionName &&
        storyCollection.get(url[1])
      ) {
        foundCollectionName = name;
      }
    });

    return foundCollectionName;
  },

  searchPlaceCollections: function(slug, id) {
    var collectionId = _.find(this.options.layers, function(layer) {
      return layer.slug === slug;
    }).id;

    return this.places[collectionId].get(id);
  },

  searchLandmarkAndPlaceCollections: function(url) {
    var foundModel;

    _.each(this.landmarks, function(landmarkCollection, collectionName) {
      var model = landmarkCollection.get(url);
      if (model) {
        model.set("datasetId", collectionName);
        foundModel = model;
      }
    });

    _.each(this.places, function(placeCollection) {
      var model = placeCollection.findWhere({ "url-title": url });
      if (model) {
        foundModel = model;
      }
    });

    return foundModel;
  },

  findModelByUrl: function(url) {
    if (url.split("/").length > 1) {
      // If the url has a slash in it with text on either side, assume we have
      // the url for a place model
      var splitUrl = url.split("/");
      return this.searchPlaceCollections(splitUrl[0], splitUrl[1]);
    } else {
      // Otherwise, we have a landmark-style url, which might correspond to a
      // landmark model or a place model
      return this.searchLandmarkAndPlaceCollections(url);
    }
  },
});

module.exports = Backbone.View.extend({
  render: function() {
    this.$el.html(Handlebars.templates["right-sidebar"]());

    new SidebarStoryCollectionView({
      el: "#sidebar-story-item-list",
      router: this.options.router,
      rightSidebarConfig: this.options.rightSidebarConfig,
      placeConfig: this.options.placeConfig,
      layers: this.options.layers,
      storyConfig: this.options.storyConfig,
      activityConfig: this.options.activityConfig,
      activityView: this.activityView,
      appView: this.options.appView,
      layerViews: this.options.layerViews,
    });
  },
});
