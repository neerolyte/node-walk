(function (undefined) {
  var fs = require('fs'),
    upath = require('path'),
    util = require('util'),
    Futures = require('futures'),
    events = require('events');

  function create(path, options) {
    // TODO add types by listener dynamically
    var emitter = new events.EventEmitter(),
      oneNodeEvents = [
        "file",
        "directory",
        "blockDevice",
        "characterDevice",
        "symbolicLink",
        "FIFO",
        "socket"
      ],
      oneNodeTypes = [
        "isFile",
        "isDirectory",
        "isBlockDevice",
        "isCharacterDevice",
        "isSymbolicLink",
        "isFIFO",
        "isSocket"
      ],
      multiNodeEvents = [
        // multiple
        "files",
        "directories",
        "blockDevices",
        "characterDevices",
        "symbolicLinks",
        "FIFOs",
        "sockets"
      ],
      fstat = (options||{}).followLinks ? fs.stat : fs.lstat;

    function normalize(path) {
      return path;
      var index;

      path = upath.normalize(path);
      index = path.length - 1;
      if (index > 0 && '/' === path[index]) {
        path = path.substr(0, index);
      }
      return path;
    }

    function sortNodesByType(path, stats, nodes, next) {
      // This could easily be unrolled
      // but in this case concise was more readable for me
      oneNodeTypes.forEach(function (isType, i) {
        if (stats[isType]()) {
          if (stats.type) { throw new Error("is_" + type + " and " + isType); }
          stats.type = oneNodeEvents[i];
          nodes[multiNodeEvents[i]].push(stats);
          // TODO throw to break;
        }
      });
      if (!stats.type) { throw new Error(upath.join(path, stats.name) + ' isAnUndefinedType'); }
    function emitSingleEvents(stats, next) {
      var num;
     
      // get the current number of listeners (may change)
      num = 1 + emitter.listeners(stats.type).length + emitter.listeners("node").length;

      function nextWhenReady() {
        num -= 1;
        if (0 === num) { next(); }
      }
      nextWhenReady();

      // Total number of listeners
      emitter.emit(stats.type, path, stats, function () {
        nextWhenReady();
      });

      emitter.emit("node", path, stats, function () {
        nextWhenReady();
      });
    } // emitSingleEvents
      emitSingleEvents(stats, next);
    }

    function getStats(path, files, walkDirs) {
      var nodes = [], o = {};

      // TODO unroll for better readability
      multiNodeEvents.forEach(function (eventType) {
        o[eventType] = [];
      });

      function nextFile() {
        var file = files.pop(), dirs = [], fnames = [];

        if (undefined === file) {
          o.directories.forEach(function (dir) {
            dirs.push(dir.name);
          });
          return walkDirs(dirs);
        }

        fstat(upath.join(path, file), function (err, stats) {
          //console.log("`stat`ed file " + file);
          stats = stats || {};
          stats.name = file;
          nodes.push(stats);

          if (err) {
            stats.error = err
            // TODO single error emittor
            o.errors.push(stats);
            util.debug("[Error 1] " + util.inspect(err));
            return nextFile();
          }
          sortNodesByType(path, stats, o, nextFile);
        });
      }
      nextFile();
    }

    function walk(path, next) {
      fs.readdir(path, function (err, nodes) {
        if (err) { return next(); /*TODO*/ throw err; }
        getStats(path, nodes, function (dirs) {
          walkDirs(path, dirs, function () {
            next();
          });
        });
      });
    }

    function walkDirs(path, dirs, cb) {
      function nextDir() {
        var dir = dirs.pop();
        if (undefined === dir) {
          delete dirs;
          return cb();
        }
        walk(upath.join(path, dir), nextDir);
      }
      nextDir();
    }

    walk(normalize(path), function () {
      //throw Error("hey");
      //console.log("Utterly Done!");
    });
    return emitter;
  }
  module.exports = create;
}());
