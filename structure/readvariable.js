// Generated by CoffeeScript 1.9.1
var readdimension;

readdimension = require('./readdimension');

module.exports = function(header, buffer, variable, cb) {
  if (typeof variable === 'string') {
    variable = header.variables[variable];
  }
  buffer.go(variable.offset);
  return buffer.read(variable.size, function(content) {
    return cb(null, readdimension(content, 0, variable));
  });
};
