var Util = require("../utils.js");

module.exports = Backbone.View.extend({
  events: {
    "click .internal-menu-item a": "onLinkClick",
    "click #nav-btn": "onMobileNavClick",
    "click #sign-in-btn": "onAuthNavClick",
  },

  render: function() {
    var data = Shareabouts.bootstrapped.currentUser,
      template = Handlebars.templates["auth-nav"](data);
    this.$el.html(template);

    return this;
  },

  onLinkClick: function(evt) {
    evt.preventDefault();
    // Hide mobile list when one is selected
    $(".access").removeClass("is-exposed");
    // Load the content
    this.options.router.navigate(evt.target.getAttribute("href"), {
      trigger: true,
    });
  },

  onMobileNavClick: function(evt) {
    evt.preventDefault();
    $(".access").toggleClass("is-exposed");
  },

  onAuthNavClick: function(evt) {
    evt.preventDefault();
    $(".sign-in-menu").toggleClass("is-exposed");
    Util.log(
      "USER",
      "page-menu",
      ($(".sign-in-menu").hasClass("is-exposed") ? "show" : "hide") + "-auth",
    );
  },
});
