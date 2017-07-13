/* A view for managing tooltip layer info windows */

module.exports = Backbone.View.extend({
  events: {
    "click .info-window-close-btn": "onClickCloseWindowBtn",
  },

  initialize: function() {
    this.state = new Backbone.Model({
      body: "",
      title: "",
      top: 0,
      left: 0,
      isVisible: false
    });

    this.options.sidebar.on("closing", this.onClickCloseWindowBtn, this);
    this.options.sidebar.on("content", this.onClickCloseWindowBtn, this);
    this.state.on("change:isVisible", this.onVisibilityChange, this);

    return this;
  },

  setState: function(content = {}) {
    for (let prop in content) {
      this.state.set(prop, content[prop]);
    }
    this.state.set("isVisible", !this.state.get("isVisible"));

    this.render();
  },

  onVisibilityChange: function() {
    (this.state.get("isVisible"))
      ? this.$el.removeClass("is-hidden")
      : this.$el.addClass("is-hidden");
  },

  onClickCloseWindowBtn: function() {
    this.state.set("isVisible", false);
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
