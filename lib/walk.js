(function () {
  var fs = require('fs'),
    Futures = require('futures'),
    joinPath = require('path').join,
    util = require('util'),
    dir = process.argv[2];

  function sortNodesByType(stats, o) {
    if (stats.isFile()) {
      o.files.push(stats);
    } else if (stats.isDirectory()) {
      o.dirs.push(stats);
    } else if (stats.isBlockDevice()) {
      o.blocks.push(stats);
    } else if (stats.isCharacterDevice()) {
      o.chars.push(stats);
    } else if (stats.isSymbolicLink()) {
      o.links.push(stats);
    } else if (stats.isFIFO()) {
      o.fifos.push(stats);
    } else if (stats.isSocket()) {
      o.sockets.push(stats);
    } else {
      util.debug(stats.node + 'is not of any node type');
    }
  }

  /*
  import os
  from os.path import join, getsize
  for root, dirs, files in os.walk('python/Lib/email'):
      print root, "consumes",
      print sum(getsize(join(root, name)) for name in files),
      print "bytes in", len(files), "non-directory files"
      if 'CVS' in dirs:
          dirs.remove('CVS')  # don't visit CVS directories
  */

  /*
    fs.walk(path, function ({ err, root, dirs, files }) {}, {
      // currently ignored
      topdown: boolean,
      onerror: boolean, // ignored
      followlinks: boolean // lstat or stat
    });
  */

  function walk(firstPath, options, callback) {
    options = options || {};
    var fstat = options.followlinks ? fs.stat : fs.lstat,
      subscription = Futures.subscription();

    if (callback) { subscription.subscribe(callback); }

    function readDir(path) {
      var p = Futures.promise();

      fs.readdir(path, function (err, files) {
        if (err) {
          err.path = path;
          subscription.deliver(err, path, undefined, undefined);
          // Signal the completion of this readdir attempt
          p.fulfill();
          return;
        }

        // TODO fix futures sequence to not require a first function like this
        var s = Futures.sequence(function(n){n();}), 
          nodes = [], 
          o = {
            errors: [], 
            files: [],
            dirs: [], 
            blocks: [], 
            chars: [], 
            links: [], 
            fifos: [], 
            sockets: []
          };

        files.forEach(function (file) {
          s.then(function (next) {
            fstat(joinPath(path, file), function (err, stats) {
              stats = stats || {};
              stats.name = file;
              nodes.push(stats);

              if (err) {
                stats.err = err;
                o.errors.push(stats);
              } else {
                sortNodesByType(stats, o);
              }

              next();
            });
          });
        });

        s.then(function (next) {
          var s2 = Futures.sequence(function(n){n();});
          subscription.deliver(undefined, path, nodes, o);
          p.fulfill();

          o.dirs.forEach(function (dir) {
            s2.then(function (next2) {
              readDir(joinPath(path, dir.name))
                .when(function () { next2(); });
            });
          });

          next();
        });

      });

      return p.passable();
    }

    readDir(firstPath) //.whenever(callback);

    return {
      whenever: subscription.subscribe
    }
  }

  module.exports = walk;
}());
