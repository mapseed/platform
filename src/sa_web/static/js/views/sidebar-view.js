/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.SidebarView = Backbone.View.extend({
    initialize: function () {

      var self = this;
    },

    render: function() {
      var self = this

      this.$el.html(Handlebars.templates['leftside-sidebar']);

      return this;
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
