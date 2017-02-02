module.exports = {
  entry: ["./src/base/static/js/routes.js", "./src/base/static/js/handlebars-helpers.js"],
  output: {
    path: "./src/base/static/dist/",
    filename: "bundle.js"
  }
}
