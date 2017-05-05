var evaluate = require('static-eval');
var parse = require('esprima').parse;

module.exports = {
  staticParse: function(condition) {
  	return evaluate(parse(condition).body[0].expression);
  }
}