// Generated by CoffeeScript 1.9.1
var file, headerbuffer, netcdf, printdelta, readfile, readrandom, readstream, start;

readfile = require('./src/readfile');

readstream = require('./src/readstream');

readrandom = require('./src/readrandom');

netcdf = require('./index');

printdelta = function(delta) {
  return delta[0] + "s " + (delta[1] / 1000000) + "ms";
};

start = process.hrtime();

file = './examples/s20150211_12z.nc';

headerbuffer = readstream(file);

netcdf.header(headerbuffer, function(header) {
  var headertime, recordbuffer;
  console.log(JSON.stringify(header, null, 2));
  headertime = process.hrtime(start);
  start = process.hrtime();
  recordbuffer = readrandom(file);
  return netcdf.variable(header, recordbuffer, 'freq', function(err, data) {
    var variabletime;
    if (err != null) {
      return console.error(err);
    }
    variabletime = process.hrtime(start);
    console.log(data);
    console.log("header parsed in " + (printdelta(headertime)));
    return console.log("variable parsed in " + (printdelta(variabletime)));
  });
});
