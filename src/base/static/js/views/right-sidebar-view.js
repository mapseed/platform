var Util = require('../utils.js');

var StoryCollection = require('../models/story-collection.js');

// a view for managing individual story items
var SidebarStoryItemView = Backbone.Marionette.ItemView.extend({
  template: "#sidebar-story-detail",
  className: "sidebar-story-item",
  serializeData: function() {
    var data = this.model.toJSON();
    _.extend(data, {
      iconUrl: this.iconUrl
    });

    return data;
  },

  onBeforeRender: function() {
    // try to find the icon for a landmark layer
    this.layerView = this.options.layerViews[this.model.get("datasetId")][this.model.get("id")];
    // try to find the icon for a place layer
    if (!this.layerView) {
      this.layerView = this.options.layerViews[this.model.get("datasetId")][this.model.cid];        
    }

    if (this.layerView &&
        this.layerView.layer instanceof L.Marker) {
      this.iconUrl = this.layerView.layer.options.icon.options.iconUrl;   
    } else {
      // else, supply a default icon (for polygon geometry, etc.)
      // TODO: this could be configurable?
      this.iconUrl = "/static/css/images/markers/map-polygon-marker.png";
    }
  },

  onRender: function(evt) {
    var self = this;
    // listen for route change events and update the story
    // list accordingly
    if (this.model.get("datasetSlug")) {
      // if the model has a slug, listen for
      // shareabouts-style urls
      if (Backbone.history.getFragment() === (this.model.get("datasetSlug") + "/" + this.model.get("id"))) {
        this.$el.addClass("story-selected");
        this.options.sidebarStoryView.storyItemSelected = true;
      }
      this.options.router.on("route", function(fn, route) {
        if ((route[0] + "/" + route[1]) === (self.model.get("datasetSlug") + "/" + self.model.get("id"))) {
          self.$el.addClass("story-selected");
          self.options.sidebarStoryView.storyItemSelected = true;
        } else {
          self.$el.removeClass("story-selected");
        }
      });   
    } else {
      // else, listen for a landmark-style url
      if (Backbone.history.getFragment() === this.model.get("id")) {
        this.$el.addClass("story-selected");
        this.options.sidebarStoryView.storyItemSelected = true;
      }
      this.options.router.on("route", function(fn, route) {
        if (route[0] === self.model.get("id")) {
          self.$el.addClass("story-selected");
          self.options.sidebarStoryView.storyItemSelected = true;
        } else {
          self.$el.removeClass("story-selected");
        }
      });    
    }
  }
});

// a view for managing a collection of story items
var SidebarStoryView = Backbone.Marionette.CollectionView.extend({
  itemView: SidebarStoryItemView,
  events: {
    "click .nav-previous-pane": "showMenu"
  },
  initialize: function() {
    this.itemViewOptions = {
      layerViews: this.options.layerViews,
      router: this.options.router,
      sidebarStoryView: this
    }
    this.storyItemSelected = false;
  },
  
  onBeforeRender: function() {
    var data = {
      header: this.options.storyHeader
    };

    this.$el.html(Handlebars.templates["sidebar-story-detail-container"](data));
  },

  onRender: function() {
    // if no place detail view is open or the current place detail
    // view is not part of the selected story, route to the first story point
    if (this.storyItemSelected === false) {
      if (this.collection.models[0].get("datasetSlug")) {
        this.options.router.navigate(this.collection.models[0].get("datasetSlug") + "/" + this.collection.models[0].get("id"), {trigger: true});
      } else {
        this.options.router.navigate(this.collection.models[0].get("id"), {trigger: true});
      }
    }
  },

  showMenu: function() {
    this.options.sidebarStoryMenuView.render();
  }
});

// a view for managing a menu of stories 
var SidebarStoryMenuView = Backbone.View.extend({
  events: {
    "click .sidebar-story-overview-item": "showStory"
  },
  
  initialize: function() {
    var self = this;

    this.landmarks = this.options.landmarks;
    this.places = this.options.places;
    this.storyCollections = {};

    // build a series of StoryCollections containing references
    // to landmark and place models in each configured story
    _.each(this.options.storyConfig, function(story, title) {
      self.storyCollections[title] = new StoryCollection([]);
      _.each(story.order, function(value, name) {
        self.storyCollections[title].add(self.findModelByUrl(name));
      });
    });
  },

  showStory: function(e) {
    var storyName = $(e.target).data("storyname");

    this.sidebarStoryView = new SidebarStoryView({
      el: ".right-sidebar-content",
      collection: this.storyCollections[storyName],
      layerViews: this.options.layerViews,
      router: this.options.router,
      storyName: storyName,
      storyHeader: this.options.storyConfig[storyName].header,
      sidebarStoryMenuView: this
    });
    this.sidebarStoryView.render();
  },

  render: function() {
    var data = {
      stories: this.options.storyConfig 
    }

    this.$el.html(Handlebars.templates["sidebar-story-overview"](data));
  },

  findModelByUrl: function(url) {
    var self = this;
    searchPlaceCollections = function(slug, id) {
      var collectionId = _.find(self.options.layers, function(layer) {
        return layer.slug === slug;
      }).id;

      return self.places[collectionId].get(id);
    },
    
    searchLandmarkAndPlaceCollections = function(url) {
      var foundModel;
      _.each(self.landmarks, function(landmarkCollection, collectionName) {
        var model = landmarkCollection.get(url);
        if (model) {
          model.set("datasetId", collectionName);
          foundModel = model;
        }
      });
      _.each(self.places, function(placeCollection) {
        var model = placeCollection.findWhere({"url-title": url});
        if (model) {
          foundModel = model;
        }
      });
      
      return foundModel;
    };
    if (url.split("/").length > 1) {
      // if the url has a slash in it with text on either
      // side, assume we have the url for a place model
      var splitUrl = url.split("/");
      return searchPlaceCollections(splitUrl[0], splitUrl[1]);
    } else {
      // otherwise, we have a landmark-style url, which might
      // correspond to a landmark model or a place model
      return searchLandmarkAndPlaceCollections(url);
    }
  }
});

// a view for managing the entire right sidebar panel
module.exports = Backbone.View.extend({
  events: {
    'click .sidebar-tab': 'onClickTab',
    //'': 'onClickPreviousPane'
    'click .sidebar-story-item': 'onClickStoryItem'

  },
  initialize: function() {
    var self = this;

    new Spinner(Shareabouts.smallSpinnerOptions).spin(this.$el.find("#right-sidebar-spinner")[0]);

    // a model for tracking overall state of the sidebar
    this.state = new Backbone.Model({
      currentTab: this.options.rightSidebarConfig.tabs[0].name
    });

    this.places = this.options.appView.places;
    this.landmarks = this.options.appView.landmarks;
    this.tabs = this.options.rightSidebarConfig.tabs;

    // wait to initialize the sidebar until all 
    // collections have loaded
    $.when.apply($, Shareabouts.deferredCollections).then(function() {
      self.render();
      self.switchTabs();
    });      
  },

  switchTabs: function() {
    // for now, support only two kinds of tabs: story
    // navigation and activity stream
    if (this.state.get("currentTab") === "story") {
      this.initStories();
    } else if (this.state.get("currentTab") === "activity") {
      this.initActivity();
    } else {
      console.warn("Unsupported sidebar tab:", self.state.get("currentTab"));
    }
  },

  initStories: function() {
    this.storyMenuView = new SidebarStoryMenuView({
      el: ".right-sidebar-content",
      landmarks: this.landmarks,
      places: this.places,
      layers: this.options.layers,
      storyConfig: this.options.storyConfig,
      rightSidebarView: this,
      layerViews: this.options.layerViews,
      router: this.options.router
    }).render();
  },

  initActivity: function() {
    // TODO: a full view for activity content here?
    $(".right-sidebar-content").html("<ul class='recent-points unstyled-list'></ul>");
    this.options.activityView.$el = $("ul.recent-points");
    this.options.activityView.render();
  },

  render: function() {
    data = {
      tabs: this.tabs
    };

    this.$el.html(Handlebars.templates['right-sidebar'](data));
  },

  onClickStoryOverview: function(e) {
    e.stopPropagation();
    this.storyModels = [];

    var self = this,
    storyName = $(e.target)
      .data("storyname"),
    tabInfo = this.tabInfo[this.currentTab];

    _.each(self.tabsConfig.story[storyName].order, function(val, url) {
      _.each(self.landmarks, function(landmarkCollection) {
        model = landmarkCollection.find(function(model) { 
          return model.get("id") === url; 
        });
        if (model) {
          self.storyModels.push(model);
        }
      });
    });
  },

  onClickTab: function(e) {
    var $tab = $(e.target),
    selectedTab = $tab.attr("id");

    this.state.set("currentTab", selectedTab);

    $(".sidebar-tab").removeClass("selected");
    $tab.addClass("selected");

    this.switchTabs();
  }
});
