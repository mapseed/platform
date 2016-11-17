var sass = require('node-sass');
var compass = require('compass-importer');
var fs = require('fs');

sass.render({
  file: 'src/sa_web/static/scss/default.scss',
  importer: compass,
  outFile: 'test.css'
}, function(error, result) {
  if(!error) {
    // No errors during the compilation, write this result on the disk
    fs.writeFile('src/sa_web/static/css/default.css', result.css, function(err){
      if(err) {
        console.log(err);
      }
    });
  } else {
    console.log(error);
  }
});
