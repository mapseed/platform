module.exports = {
  entry: ["./src/sa_web/static/js/routes.js", "./src/sa_web/static/js/handlebars-helpers.js"],
  output: {
    path: "./src/sa_web/static/dist/",
    filename: "bundle.js"
  }
}
