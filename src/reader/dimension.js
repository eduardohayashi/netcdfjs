// Generated by CoffeeScript 1.9.1
var buildreader, type;

type = require('./type');

buildreader = function(variable) {
  var fill;
  fill = variable.attributes._FillValue || type.fill(variable.type);
  return type.reader(variable.type, fill);
};

module.exports = function(content, position, variable) {
  var indexes, lengths, products, readdim, reader, ref, size, sizes;
  reader = buildreader(variable);
  size = type.size(variable.type);
  if (variable.dimensions.indexes.length === 0) {
    return reader(content, position);
  }
  ref = variable.dimensions, indexes = ref.indexes, sizes = ref.sizes, products = ref.products, lengths = ref.lengths;
  readdim = function(index, offset) {
    var i, j, k, ref1, ref2, results, results1;
    if (index === indexes.length - 1) {
      return (function() {
        results = [];
        for (var j = 0, ref1 = products[index]; 0 <= ref1 ? j < ref1 : j > ref1; 0 <= ref1 ? j++ : j--){ results.push(j); }
        return results;
      }).apply(this).map(function(i) {
        return reader(content, offset + i * size);
      });
    }
    results1 = [];
    for (i = k = 0, ref2 = lengths[index]; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
      results1.push(readdim(index + 1, offset + i * sizes[index]));
    }
    return results1;
  };
  return readdim(0, position);
};
