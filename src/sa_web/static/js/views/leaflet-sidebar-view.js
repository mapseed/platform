
var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LeafletSidebarView = Backbone.View.extend({
    events{};

    initialize: function () {
        var self = this;
    },

    render: function () {
        var self = this;

        this.$el.html(Handlebars.templates['leaflet-sidebar']());

        return this;
    },
  });
})(Shareabouts, jQuery, Shareabouts.Util.console);
