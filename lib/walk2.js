(function () {
  var fs = require('fs'),
    upath = require('path'),
    util = require('util'),
    Futures = require('futures'),
    events = require('events'),
    emitter = new events.EventEmitter(),
    oneNodeEvents = [
      "file",
      "directory",
      "blockDevice",
      "characterDevice",
      "symbolicLink",
      "fifo",
      "socket"
    ],
    multiNodeEvents = [
      // multiple
      "files",
      "directories",
      "blockDevices",
      "characterDevices",
      "symbolicLinks",
      "fifos",
      "sockets"
    ],
    fstat;

  function sortNodesByType(path, stats, o, next) {
    var type, listeners, num, count;

    if (stats.isFile()) {
      type = "file";
      o.files.push(stats);
    } else if (stats.isDirectory()) {
      type = "directory";
      o.dirs.push(stats);
    } else if (stats.isBlockDevice()) {
      type = "blockDevice";
      o.blocks.push(stats);
    } else if (stats.isCharacterDevice()) {
      type = "characterDevice";
      o.chars.push(stats);
    } else if (stats.isSymbolicLink()) {
      type = "symbolicLink";
      o.links.push(stats);
    } else if (stats.isFIFO()) {
      type = "fifo";
      o.fifos.push(stats);
    } else if (stats.isSocket()) {
      type = "socket";
      o.sockets.push(stats);
    } else {
      throw new Error(upath.join(path,stats.name) + 'is not of any tested node type');
    }
   
    listeners = emitter.listeners(type);
    // get the current number of listeners (may change)
    num = listeners.length;
    if (!num) {
      next();
      return;
    }

    // join all; once all listeners have responded, continue
    count = 0;
    emitter.emit(type, path, stats, function () {
      count += 1;
      if (num === count) {
        next();
      }
    });
  }

  function handleFiles(path, files) {
    var s = Futures.sequence(),
      nodes = [],
      o = {
        errors: [],
        dirs: [],
        files: [],
        links: [],
        blocks: [],
        chars: [],
        fifos: [],
        sockets: []
      };

    files.forEach(function (file) {
      s.then(function (next) {
        fstat(upath.join(path, file), function (err, stats) {
          if (err) {
            util.debug("[Error] " + util.inspect(err));
            next();
            return;
          }
          stats.name = file;
          sortNodesByType(path, stats, o, next);
        });
      });
    });
    s.then(function (next) {
      // TODO copycat the emitters above
      next();
    });
    return s;
  }

  function handlePath(path) {
    
  }

  function walk(fullpath, options) {
    fstat = (options||{}).followLinks ? fs.stat : fs.lstat;

    var path, file, len, s;

    upath.normalize(fullpath);

    len = fullpath.length - 1;
    if (len > 1 && '/' === fullpath[len]) {
      fullpath = fullpath.substr(0, len);
    }

    path = upath.dirname(fullpath);
    file = upath.basename(fullpath);

    s = handleFiles(path, [file]);
    s(function (next) { next(); });
    return emitter;
  }

  var walker = walk("/System");
  walker.on("directory", function (path, dir, next) {
    console.log(path, dir.name);
    next();
  });
}());
