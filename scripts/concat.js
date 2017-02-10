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
shell.rm('-rf', 'src/base/static/dist')
shell.mkdir('-p', 'src/base/static/dist/images')

shell.cat([
  'src/base/static/libs/underscore.js',
  'src/base/static/libs/backbone.js',
  'src/base/static/libs/backbone.marionette.js',
  'src/base/static/libs/handlebars-v3.0.3.js',
  'src/base/static/libs/moment-with-locales.min.js',
  'src/base/static/libs/json2.js',
  'src/base/static/libs/binaryajax.js',
  'src/base/static/libs/exif.js',
  'src/base/static/libs/load-image.js',
  'src/base/static/libs/canvas-to-blob.js',
  'src/base/static/libs/spin.min.js',
  'src/base/static/libs/gatekeeper.js',
  'src/base/static/libs/swag.min.js',
  'src/base/static/libs/jquery.scrollTo.js',
  'src/base/static/libs/jquery.datetimepicker.full.min.js',
  'src/base/static/libs/handlebars-helpers.js',
  'src/base/static/libs/leaflet.argo.js',
  'src/base/static/libs/leaflet.sidebar.js',
  'src/base/static/libs/esri-leaflet.js'
]).to('src/base/static/dist/cat-lib-bundle.js')

shell.cat([
  'src/base/static/js/handlebars-helpers.js',
  'src/base/static/js/models.js',
  'src/base/static/js/views/pages-nav-view.js',
  'src/base/static/js/views/auth-nav-view.js',
  'src/base/static/js/views/activity-view.js',
  'src/base/static/js/views/app-view.js',
  'src/base/static/js/views/layer-view.js',
  'src/base/static/js/views/basic-layer-view.js',
  'src/base/static/js/views/place-counter-view.js',
  'src/base/static/js/views/geocode-address-view.js',
  'src/base/static/js/views/geocode-address-place-view.js',
  'src/base/static/js/views/support-view.js',
  'src/base/static/js/views/survey-view.js',
  'src/base/static/js/views/landmark-survey-view.js',
  'src/base/static/js/views/place-detail-view.js',
  'src/base/static/js/views/landmark-detail-view.js',
  'src/base/static/js/views/place-form-view.js',
  'src/base/static/js/views/place-list-view.js',
  'src/base/static/js/views/map-view.js',
  'src/base/static/js/views/legend-view.js',
  'src/base/static/js/views/gis-legend-view.js',
  'src/base/static/js/views/sidebar-view.js',
  'src/base/static/js/views/rich-text-editor-view.js',
  'src/base/static/js/routes.js',
  'src/flavors/' + flavor + '/static/js/*.js',
  'src/flavors/' + flavor + '/static/js/views/*.js'
]).to('src/base/static/dist/cat-bundle.js')

shell.cat([
  'src/base/static/js/utils.js',
  'src/base/static/js/template-helpers.js',
]).to('src/base/static/dist/cat-preload-bundle.js')

shell.cat([
  'src/base/static/css/leaflet-sidebar.css',
  'src/base/static/css/default.css',
  'src/base/static/css/jquery.datetimepicker.css',
  'src/flavors/' + flavor + '/static/css/custom.css'
]).to('src/base/static/dist/cat-bundle.css')

shell.cp('-R', [
  'src/base/static/css/images/*',
  'src/flavors/' + flavor + '/static/css/images/*'
], 'src/base/static/dist/images')
