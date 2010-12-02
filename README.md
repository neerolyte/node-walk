node-walk
====

A not-quite-port of python's `os.walk`.

Installation
----

    npm install walk

Usage
====

All of the examples in the folder included in this repository work and have no typos.

without emitter
----

    var walk = require('walk').walk,
      options = {
        followLinks: false,
      };

    function fileHandler(err, path, errors, dirs, files, links, blocks, chars, fifos, sockets) {
      // handle each path  
    }

    walk("path/to/dir", options, fileHandler);
    // This also works
    // walk("path/to/dir", options).whenever(fileHandler);

Single Arguments

  * `err` - Error when reading path (Probably due to permissions).
  * `path` - the current path being read

Array Arguments

  * `errors` - `fs.stat` encountered on files in the directory
  * `dirs` - directories (modification of this array - sorting, removing, etc - affects traversal)
  * `files` - regular files (includes links when `followLinks` is `true`)
  * `links` - symbolic links (always empty when `followLinks` is `true`)
  * `blocks` - block devices
  * `chars` - character devices
  * `fifos` - FIFOs
  * `sockets` - sockets

using emitter
----

`errors`, `directories`, `files`, `symbolicLinks`

    var walk = require('walk').walk,
      emitter = walk('./walk-test');

    emitter.on("directories", function (path, dirs) {
      // the second directory will not be traversed
      dirs.splice(1,1);
      dirs.forEach(function (dir) {
        console.log(dir);
      });
    });

    emitter.on("files", function (path, files) {
      files.forEach(function (dir) {
        console.log(dir);
      });
    });

Example
====

    mkdir -p walk-test/dir1
    touch walk-test/file-1
    touch walk-test/file-2
    touch walk-test/dir1/file-1
    touch walk-test/dir1/file-2

node-walk-test
----

    var walk = require('walk');

    walk('./walk-test', undefined,  function (err, path, errors, dirs, files, links) {
      if (err) {
        console.log('ERROR: ');
        console.log(err);
        return;
      }

      dirs.forEach(function (item, i, arr) {
        if (item.name.match(/trash/i)) {
          console.log('found a trash');
          arr.splice(i,1);
        }
      });

      console.log("PATH: " + path);
      console.log("SORTED: ");
      console.log(errors, dirs, files, links);
    });
