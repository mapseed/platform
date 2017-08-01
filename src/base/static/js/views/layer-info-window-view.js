/* A view for managing tooltip layer info windows */

module.exports = Backbone.View.extend({
  events: {
    "click .info-window-close-btn": "hide",
  },

  initialize: function() {
    this.state = new Backbone.Model({
      body: "",
      title: "",
      top: 0,
      left: 0,
      isVisible: false,
      lastActiveInfoWindowId: null
    });

    this.options.sidebar.on("closing", this.hide, this);
    this.options.sidebar.on("content", this.hide, this);
    this.state.on("change:isVisible", this.onVisibilityChange, this);

    return this;
  },

  setState: function(content = {}) {
    if (!content.lastActiveInfoWindowId
        || content.lastActiveInfoWindowId !== this.state.get("lastActiveInfoWindowId")) {
      this.state.set("isVisible", true);
    } else {
      this.state.set("isVisible", !this.state.get("isVisible"));
    }

    for (let prop in content) {
      this.state.set(prop, content[prop]);
    }

    this.render();
  },

  hide: function() {
    this.state.set("isVisible", false);
    this.state.set("lastActiveInfoWindowId", null);
  },

  onVisibilityChange: function() {
    (this.state.get("isVisible"))
      ? this.$el.removeClass("is-hidden-fadeout")
      : this.$el.addClass("is-hidden-fadeout");
  },

  render: function() {
    let data = {
      title: this.state.get("title"),
      body: this.state.get("body")
    };

    this.$el
      .html(Handlebars.templates["layer-info-window"](data))
      .css({
        top: this.state.get("top") - (this.$el.height() / 2),
        left: this.state.get("left")
      });
  }
});
