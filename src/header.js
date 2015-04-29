// Generated by CoffeeScript 1.9.1
var async, marker, roundup;

roundup = require('./roundup');

async = require('odo-async');

marker = {
  streaming: -1,
  zero: 0,
  dimension: 10,
  variable: 11,
  attribute: 12
};

module.exports = function(buffer, callback) {
  var att_list, attr, dim, dim_list, fill, gatt_list, header, magic, many, name, numrecs, one, precompute, precompute_size, type, var_list, variable, vatt_list;
  one = require('./primatives')(buffer);
  many = require('./arrays')(buffer);
  fill = require('./arraysfill')(buffer);
  type = require('./types')(buffer);
  header = function(cb) {
    var result;
    result = {};
    return magic(function(res) {
      result.version = res;
      return numrecs(function(res) {
        result.records = res;
        return dim_list(function(res) {
          result.dimensions = res;
          return gatt_list(function(res) {
            result.attributes = res;
            return var_list(function(res) {
              result.variables = res;
              buffer.close();
              return cb(precompute(result));
            });
          });
        });
      });
    });
  };
  precompute = function(header) {
    var _, dim, j, len, name, ref, ref1, ref2, ref3, ref4, v;
    ref = header.dimensions;
    for (j = 0, len = ref.length; j < len; j++) {
      dim = ref[j];
      if (dim.length === null) {
        header.records.dimension = dim.index;
        break;
      }
    }
    ref1 = header.variables;
    for (_ in ref1) {
      v = ref1[_];
      precompute_size(v, header);
    }
    header.records.hassingle = false;
    ref2 = header.variables;
    for (_ in ref2) {
      v = ref2[_];
      if (v.isrecord) {
        if (header.hassinglerecord) {
          header.records.hassingle = false;
          break;
        }
        header.records.hassingle = true;
      }
    }
    header.records.size = 0;
    header.records.offset = Infinity;
    ref3 = header.variables;
    for (_ in ref3) {
      v = ref3[_];
      if (!v.isrecord) {
        continue;
      }
      header.records.offset = Math.min(v.offset, header.records.offset);
      header.records.size += v.size;
    }
    if (!header.hassinglerecord) {
      header.records.size = roundup(header.records.size, 4);
    }
    header.records.offsets = {};
    ref4 = header.variables;
    for (name in ref4) {
      v = ref4[name];
      if (!v.isrecord) {
        continue;
      }
      header.records.offsets[name] = v.offset - header.records.offset;
    }
    return header;
  };
  precompute_size = function(variable, header) {
    var indexes, product, products, sizes;
    indexes = variable.dimensions;
    variable.dimensions = {
      indexes: indexes,
      lengths: [],
      sizes: [],
      products: []
    };
    if (indexes.length === 0) {
      return;
    }
    variable.dimensions.lengths = indexes.map(function(i) {
      return header.dimensions[i].length;
    });
    product = 1;
    products = variable.dimensions.lengths.slice(0).reverse().map(function(length) {
      product *= length;
      return product;
    });
    products = products.reverse();
    variable.dimensions.products = products;
    sizes = products.map(function(p) {
      return p * variable.size;
    });
    variable.dimensions.sizes = products.map(function(p) {
      return p * type.size(variable.type);
    });
    variable.isrecord = false;
    if (header.dimensions[indexes[0]].length === null) {
      variable.isrecord = true;
      variable.dimensions.indexes.shift();
      variable.dimensions.lengths.shift();
      variable.dimensions.products.shift();
      variable.dimensions.sizes.shift();
    }
    variable.size = type.size(variable.type);
    if (variable.dimensions.indexes.length !== 0) {
      return variable.size = variable.dimensions.sizes[0];
    }
  };
  magic = function(cb) {
    many.char(3, function(magicstring) {
      if (magicstring !== 'CDF') {
        throw new Error('Not a valid NetCDF file ' + magicstring);
      }
    });
    return one.byte(function(version) {
      var description;
      if (version !== 1 && version !== 2 && version !== 3) {
        throw new Error("Unknown NetCDF format (version " + version + ")");
      }
      if (version === 1) {
        description = 'Classic format';
      }
      if (version === 2) {
        description = '64 bit offset format';
      }
      return cb({
        number: version,
        description: description
      });
    });
  };
  numrecs = function(cb) {
    return one.int(function(count) {
      if (count === marker.streaming) {
        return cb({
          type: 'streaming'
        });
      }
      return cb({
        type: 'fixed',
        number: count
      });
    });
  };
  dim_list = function(cb) {
    return one.int(function(mark) {
      if (mark === marker.zero) {
        return one.int(function() {
          return cb({});
        });
      }
      if (mark !== marker.dimension) {
        throw new Error('Dimension marker not found');
      }
      return one.int(function(count) {
        var j, result, results, tasks;
        result = [];
        tasks = (function() {
          results = [];
          for (var j = 0; 0 <= count ? j < count : j > count; 0 <= count ? j++ : j--){ results.push(j); }
          return results;
        }).apply(this).map(function(index) {
          return function(cb) {
            return dim(function(res) {
              res.index = index;
              result.push(res);
              return cb(res);
            });
          };
        });
        return async.series(tasks, function() {
          return cb(result);
        });
      });
    });
  };
  dim = function(cb) {
    return name(function(name) {
      return one.int(function(length) {
        if (length === 0) {
          length = null;
        }
        return cb({
          name: name,
          length: length
        });
      });
    });
  };
  name = function(cb) {
    return one.int(function(length) {
      return fill.char(length, cb);
    });
  };
  gatt_list = function(cb) {
    return att_list(cb);
  };
  vatt_list = function(cb) {
    return att_list(cb);
  };
  att_list = function(cb) {
    return one.int(function(mark) {
      if (mark === marker.zero) {
        return one.int(function() {
          return cb({});
        });
      }
      if (mark !== marker.attribute) {
        throw new Error('Attribute marker not found');
      }
      return one.int(function(count) {
        var j, result, results, tasks;
        result = {};
        tasks = (function() {
          results = [];
          for (var j = 0; 0 <= count ? j < count : j > count; 0 <= count ? j++ : j--){ results.push(j); }
          return results;
        }).apply(this).map(function() {
          return function(cb) {
            return attr(function(attr) {
              result[attr.name] = attr.value;
              return cb();
            });
          };
        });
        return async.series(tasks, function() {
          return cb(result);
        });
      });
    });
  };
  attr = function(cb) {
    return name(function(name) {
      return type.type(function(t) {
        return one.int(function(count) {
          return type.reader(t)(count, function(value) {
            return cb({
              name: name,
              value: value
            });
          });
        });
      });
    });
  };
  var_list = function(cb) {
    return one.int(function(mark) {
      if (mark === marker.zero) {
        return one.int(function() {
          return cb({});
        });
      }
      if (mark !== marker.variable) {
        throw new Error('Attribute marker not found');
      }
      return one.int(function(count) {
        var j, result, results, tasks;
        result = {};
        tasks = (function() {
          results = [];
          for (var j = 0; 0 <= count ? j < count : j > count; 0 <= count ? j++ : j--){ results.push(j); }
          return results;
        }).apply(this).map(function() {
          return function(cb) {
            return variable(function(variable) {
              result[variable.name] = variable.value;
              return cb();
            });
          };
        });
        return async.series(tasks, function() {
          return cb(result);
        });
      });
    });
  };
  variable = function(cb) {
    return name(function(name) {
      return one.int(function(dimnum) {
        var dimindexes, j, results, tasks;
        dimindexes = [];
        tasks = (function() {
          results = [];
          for (var j = 0; 0 <= dimnum ? j < dimnum : j > dimnum; 0 <= dimnum ? j++ : j--){ results.push(j); }
          return results;
        }).apply(this).map(function() {
          return function(cb) {
            return one.int(function(index) {
              dimindexes.push(index);
              return cb();
            });
          };
        });
        return async.series(tasks, function() {
          return vatt_list(function(attributes) {
            return type.type(function(t) {
              return one.int(function(size) {
                return one.int(function(offset) {
                  return cb({
                    name: name,
                    value: {
                      dimensions: dimindexes,
                      attributes: attributes,
                      type: t,
                      size: size,
                      offset: offset
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  };
  return header(function(res) {
    return callback(res);
  });
};
