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
  'src/base/static/css/leaflet-sidebar.css',
  'src/base/static/css/quill.snow.css',
  'src/base/static/css/default.css',
  'src/base/static/css/jquery.datetimepicker.css',
  'src/flavors/' + flavor + '/static/css/custom.css'
]).to('src/base/static/dist/cat-bundle.css')

shell.cp('-R', [
  'src/base/static/css/images/*',
  'src/flavors/' + flavor + '/static/css/images/*'
], 'src/base/static/dist/images')
