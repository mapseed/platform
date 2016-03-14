var env = require('node-env-file')

try {
  env('src/.env', { overwrite: true })
} catch (err) {
  if (err.name !== 'TypeError' || err.message.lastIndexOf('Environment', 0) === -1) {
    throw err
  }
}
var flavor = process.env.FLAVOR ? process.env.FLAVOR : "duwamish_flavor"

var shell = require('shelljs')
shell.rm('-rf', 'src/sa_web/static/dist')
shell.mkdir('-p', 'src/sa_web/static/dist/images')

shell.cat([
  'src/sa_web/static/libs/underscore.js',
  'src/sa_web/static/libs/backbone.js',
  'src/sa_web/static/libs/backbone.marionette.js',
  'src/sa_web/static/libs/handlebars-v3.0.3.js',
  'src/sa_web/static/libs/moment-with-locales.min.js',
  'src/sa_web/static/libs/json2.js',
  'src/sa_web/static/libs/binaryajax.js',
  'src/sa_web/static/libs/exif.js',
  'src/sa_web/static/libs/load-image.js',
  'src/sa_web/static/libs/canvas-to-blob.js',
  'src/sa_web/static/libs/spin.min.js',
  'src/sa_web/static/libs/gatekeeper.js',
  'src/sa_web/static/libs/swag.min.js',
  'src/sa_web/static/libs/jquery.scrollTo.js',
  'src/sa_web/static/libs/handlebars-helpers.js',
  'src/sa_web/static/libs/leaflet.argo.js',
  'src/sa_web/static/libs/leaflet.sidebar.js'
]).to('src/sa_web/static/dist/cat-lib-bundle.js')

shell.cat([
  'src/sa_web/static/js/handlebars-helpers.js',
  'src/sa_web/static/js/models.js',
  'src/sa_web/static/js/views/pages-nav-view.js',
  'src/sa_web/static/js/views/auth-nav-view.js',
  'src/sa_web/static/js/views/activity-view.js',
  'src/sa_web/static/js/views/app-view.js',
  'src/sa_web/static/js/views/layer-view.js',
  'src/sa_web/static/js/views/basic-layer-view.js',
  'src/sa_web/static/js/views/legend-view.js',
  'src/sa_web/static/js/views/place-counter-view.js',
  'src/sa_web/static/js/views/geocode-address-view.js',
  'src/sa_web/static/js/views/geocode-address-place-view.js',
  'src/sa_web/static/js/views/support-view.js',
  'src/sa_web/static/js/views/survey-view.js',
  'src/sa_web/static/js/views/landmark-survey-view.js',
  'src/sa_web/static/js/views/place-detail-view.js',
  'src/sa_web/static/js/views/landmark-detail-view.js',
  'src/sa_web/static/js/views/place-form-view.js',
  'src/sa_web/static/js/views/dataset-form-view.js',
  'src/sa_web/static/js/views/place-list-view.js',
  'src/sa_web/static/js/views/map-view.js',
  'src/sa_web/static/js/views/gis-legend-view.js',
  'src/sa_web/static/js/routes.js',
  'src/flavors/' + flavor + '/static/js/*.js',
  'src/flavors/' + flavor + '/static/js/views/*.js'
]).to('src/sa_web/static/dist/cat-bundle.js')

shell.cat([
  'src/sa_web/static/js/utils.js',
  'src/sa_web/static/js/template-helpers.js'
]).to('src/sa_web/static/dist/cat-preload-bundle.js')

shell.cat([
  'src/sa_web/static/css/normalize.css',
  'src/sa_web/static/css/default.css',
  'src/sa_web/static/css/leaflet-sidebar.css',
  'src/flavors/' + flavor + '/static/css/custom.css'
]).to('src/sa_web/static/dist/cat-bundle.css')

shell.cp('-R', [
  'src/sa_web/static/css/images/*',
  'src/flavors/' + flavor + '/static/css/images/*'
], 'src/sa_web/static/dist/images')
