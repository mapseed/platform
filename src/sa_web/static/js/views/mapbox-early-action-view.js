/*globals Backbone _ jQuery Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.MapboxEarlyActionView = Backbone.View.extend({
    initialize: function() {
      var self = this;
      this.title = this.options.title
      this.description = this.options.description

      this.mapboxSurveyView = new S.MapboxSurveyView({
      });
    },

    render: function() {
      var self = this,
          data = {
            title: this.title,
            description: this.description
          };

      this.$el.html(this.title + '</br>' + this.description);
      // Render the view as-is (collection may have content already)
      this.$('.survey').html(this.mapboxSurveyView.render().$el);

      return this;
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
