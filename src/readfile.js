// Generated by CoffeeScript 1.9.1
var fs, readbuffer;

fs = require('fs');

readbuffer = require('./readbuffer');

module.exports = function(file) {
  var ab, buf, i, j, ref, view;
  buf = fs.readFileSync(file, {
    encoding: null
  });
  ab = new ArrayBuffer(buf.length);
  view = new Uint8Array(ab);
  for (i = j = 0, ref = buf.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    view[i] = buf[i];
  }
  return readbuffer(ab);
};
