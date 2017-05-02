  var Util = require('../utils.js');

  module.exports = Backbone.View.extend({
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
            has_pages: (navPageConfig.length > 0),
            show_list_button_label: this.options.placeConfig.show_list_button_label,
            show_map_button_label: this.options.placeConfig.show_map_button_label
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
      Util.log('USER', 'page-menu', 'click-link', evt.target.getAttribute('href') + " -- " + evt.target.textContent);
    },

    onMobileNavClick: function(evt) {
      evt.preventDefault();
      $('.access').toggleClass('is-exposed');
      Util.log('USER', 'page-menu', ($('.access').hasClass('is-exposed') ? 'show' : 'hide') + '-mobile-nav');
    },

    onAuthNavClick: function(evt) {
      evt.preventDefault();
      $('.sign-in-menu').toggleClass('is-exposed');
    }
  });
