/*globals _ jQuery L Backbone Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){

  S.AppView = S.AppView.extend({

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
      this.showPanel(this.placeFormView.render(false).$el);
      this.placeFormView.postRender();

      this.placeFormView.delegateEvents();
      // Init the place form's address search bar
      this.geocodeAddressPlaceView = (new S.GeocodeAddressPlaceView({
        el: '#geocode-address-place-bar',
        router: this.options.router,
        mapConfig: this.options.mapConfig
      })).render();

      $(".maximize-btn").show();
      $(".minimize-btn").hide();

      $(".list-toggle-nav").show();

      this.showNewPin();
      this.setBodyClass('content-visible', 'place-form-visible');
    },

    viewPage: function(slug) {
      var pageConfig = S.Util.findPageConfig(this.options.pagesConfig, {slug: slug}),
          pageTemplateName = 'pages/' + (pageConfig.name || pageConfig.slug),
          pageHtml = Handlebars.templates[pageTemplateName]({config: this.options.config});

      $(".maximize-btn").hide();
      $(".minimize-btn").show();

      this.$panel.removeClass().addClass('page page-' + slug);
      this.showPanel(pageHtml);

      this.hideNewPin();
      this.destroyNewModels();
      this.hideCenterPoint();
      this.setBodyClass('content-visible', 'content-expanded', 'page-visible');

      // swap list view and add place btns
      $(".list-toggle-nav").hide();
      $("#main-btns-container")
        .detach()
        .insertAfter("#pages-nav-container");
    },

    hidePanel: function() {
      var map = this.mapView.map;

      this.unfocusAllPlaces();
      this.$panel.hide();
      this.setBodyClass();
      map.invalidateSize({ animate:true, pan:true });

      $(".list-toggle-nav").show();
      $("#main-btns-container").attr("class", "pos-top-right");

      S.Util.log('APP', 'panel-state', 'closed');
      this.hideSpotlightMask();
    },

    showListView: function() {
      this.setBodyClass("list-visible");

      // Re-sort if new places have come in
      this.listView.sort();
      // Show
      this.listView.$el.addClass('is-exposed');
      $('.show-the-list').addClass('is-visuallyhidden');
      $('.show-the-map').removeClass('is-visuallyhidden');
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
