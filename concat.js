var env = require('node-env-file')

env('src/.env')
var flavor = process.env.FLAVOR ? process.env.FLAVOR : "duwamish_flavor"

var shell = require('shelljs')
shell.cat([
  'src/sa_web/static/js/handlebars-helpers.js',
  'src/sa_web/static/js/models.js',
  'src/sa_web/static/js/views/pages-nav-view.js',
  'src/sa_web/static/js/views/auth-nav-view.js',
  'src/sa_web/static/js/views/activity-view.js',
  'src/sa_web/static/js/views/app-view.js',
  'src/sa_web/static/js/views/layer-view.js',
  'src/sa_web/static/js/views/legend-view.js',
  'src/sa_web/static/js/views/place-counter-view.js',
  'src/sa_web/static/js/views/geocode-address-view.js',
  'src/sa_web/static/js/views/geocode-address-place-view.js',
  'src/sa_web/static/js/views/support-view.js',
  'src/sa_web/static/js/views/survey-view.js',
  'src/sa_web/static/js/views/place-detail-view.js',
  'src/sa_web/static/js/views/place-form-view.js',
  'src/sa_web/static/js/views/place-list-view.js',
  'src/sa_web/static/js/views/map-view.js',
  'src/sa_web/static/js/routes.js',
  'src/flavors/' + flavor + '/static/js/**.js'
]).to('src/sa_web/static/dist/app2.js')

shell.cat([
  'src/sa_web/static/js/utils.js',
  'src/sa_web/static/js/template-helpers.js'
]).to('src/sa_web/static/dist/preload2.js')

shell.cat([
  'src/sa_web/static/css/normalize.css',
  'src/sa_web/static/css/default.css',
  'src/flavors/' + flavor + '/static/css/custom.css'
]).to('src/sa_web/static/dist/app2.css')
