/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console) {

  // a view for managing individual story items
  S.SidebarStoryItemView = Backbone.Marionette.ItemView.extend({
    template: "#sidebar-story-detail",
    className: "sidebar-story-item",
    initialize: function() {
  
    },

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
        }
        this.options.router.on("route", function(fn, route) {
          if ((route[0] + "/" + route[1]) === (self.model.get("datasetSlug") + "/" + self.model.get("id"))) {
            self.$el.addClass("story-selected");
          } else {
            self.$el.removeClass("story-selected");
          }
        });   
      } else {
        // else, listen for a landmark-style url
        if (Backbone.history.getFragment() === this.model.get("id")) {
          this.$el.addClass("story-selected");
        }
        this.options.router.on("route", function(fn, route) {
          if (route[0] === self.model.get("id")) {
            self.$el.addClass("story-selected");
          } else {
            self.$el.removeClass("story-selected");
          }
        });    
      }
    },
  });

  // a view for managing a collection of story items
  S.SidebarStoryView = Backbone.Marionette.CollectionView.extend({
    template: "#sidebar-story-detail-container",
    itemView: S.SidebarStoryItemView,
    itemViewContainer: ".sidebar-content",
    initialize: function() {
      this.itemViewOptions = {
        layerViews: this.options.layerViews,
        router: this.options.router
      }
    },

    onBeforeRender: function() {
      $(this.itemViewContainer).empty();
    }
  });

  // a view for managing a menu of stories 
  S.SidebarStoryMenuView = Backbone.View.extend({
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
        self.storyCollections[title] = new S.StoryCollection([]);
        _.each(story.order, function(value, name) {
          self.storyCollections[title].add(self.findModelByUrl(name));
        });
      });
    },

    showStory: function(e) {
      var storyName = $(e.target).data("storyname");

      // render SidebarStoryView...
      //this.sidebarStoryView.collection = this.storyCollections[storyName];
      this.sidebarStoryView = new S.SidebarStoryView({
        el: ".sidebar-content",
        collection: this.storyCollections[storyName],
        layerViews: this.options.layerViews,
        router: this.options.router
      });
      this.sidebarStoryView.render(storyName);
      //this.storyCollections[storyName].trigger("reset");

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
  S.RightSidebarView = Backbone.View.extend({
    events: {
      'click .sidebar-tab': 'onClickTab',
      //'': 'onClickPreviousPane'
      'click .sidebar-story-item': 'onClickStoryItem'

    },
    initialize: function() {
      var self = this;

      new Spinner(S.smallSpinnerOptions).spin(this.$el.find("#right-sidebar-spinner")[0]);

      // wait to initialize the sidebar until all 
      // collections have loaded
      $.when.apply($, S.deferredCollections).then(function() {
        self.render();
        self.storyMenuView = new S.SidebarStoryMenuView({
          el: ".sidebar-content",
          landmarks: self.landmarks,
          places: self.places,
          layers: self.options.layers,
          storyConfig: self.options.storyConfig,
          rightSidebarView: self,
          layerViews: self.options.layerViews,
          router: self.options.router
        }).render();
      });

      this.places = this.options.appView.places;
      this.landmarks = this.options.appView.landmarks;
      this.tabs = this.options.rightSidebarConfig.tabs;

      // a model for tracking overall state of the sidebar
      this.state = new Backbone.Model.extend({
        currentTab: this.tabs[0].name
      });
    },

    render: function() {
      data = {
        tabs: this.tabs
      };

      this.$el.html(Handlebars.templates['right-sidebar'](data));

    },

    renderTabContent: function(tabName, content) {


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

      var data = {
        header: this.tabsConfig.story[storyName].header,
        models: self.storyModels,
        currentRoute: Backbone.history.getFragment()
      };

      self.$rightSidebarContent.html(
        Handlebars.templates[tabInfo.tabTemplates[1]](data)
      );
    },

    onClickPreviousPane: function(e) {

    },

    onClickStoryItem: function(e) {

    },

    onClickTab: function(e) {
      var $tab = $(e.target),
      selectedTab = $tab.attr("id"),
      pane = $tab.data("pane"),
      tabTemplates = _.find(this.tabs, function(tab) {
        return tab.name === selectedTab;
      }).templates;

      this.tabInfo[selectedTab] = {
        pane: pane,
        tabTemplates: tabTemplates
      }

      this.currentTab = selectedTab;

      $(".sidebar-tab").removeClass("selected");
      $tab.addClass("selected");

      var data = {
        stories: this.tabsConfig[selectedTab]
      };

      this.$rightSidebarContent.html(Handlebars.templates[tabTemplates[pane]](data));
    }
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
