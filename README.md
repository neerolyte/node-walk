node-walk
====

A not-quite-port of python's `os.walk`.

Installation
----

    npm install walk

Usage
====

    var walk = require('walk'),
      options = {
        followlinks: false,
        topdown: false, // currently ignored
      };

    function fileHandler(err, path, nodes, sorted) {
      // handle each path  
    }

    walk("path/to/dir", options, fileHandler);
    // This also works
    // walk("path/to/dir", options).whenever(fileHandler);

  * err - Probably can't read a directory due to permissions.
  * path - the current path being read
  * nodes - an array of `stats`
  * sorted - `nodes` sorted by type
    * `errors` - nodes that could not be `stat`ed and why
    * `files` - actual files (or links when `followlinks` is `true`)
    * `dirs` - directories
    * `blocks` - block devices
    * `chars` - character devices
    * `links` - symbolic links
    * `fifos` - FIFOs
    * `sockets` - sockets

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

    walk('./walk-test', undefined,  function (err, path, nodes, sorted) {
      if (err) {
        console.log('ERROR: ');
        console.log(err);
        return;
      }
      o.dirs.forEach(function (item, i, arr) {
        if (item.name.match(/trash/i)) {
          console.log('found a trash');
          arr.splice(i,1);
        }
      });
      console.log("PATH: " + path);
      console.log("SORTED: ");
      console.log(o);
    });


Output
----

    PATH: ./walk-test
    SORTED: 
    { errors: [],
      files: 
       [ { dev: 234881026,
           ino: 30682245,
           mode: 33204,
           nlink: 1,
           uid: 504,
           gid: 20,
           rdev: 0,
           size: 0,
           blksize: 4096,
           blocks: 0,
           atime: Sun, 21 Nov 2010 04:48:23 GMT,
           mtime: Sun, 21 Nov 2010 04:48:23 GMT,
           ctime: Sun, 21 Nov 2010 04:48:23 GMT,
           name: 'file-1' },
         { dev: 234881026,
           ino: 30682246,
           mode: 33204,
           nlink: 1,
           uid: 504,
           gid: 20,
           rdev: 0,
           size: 0,
           blksize: 4096,
           blocks: 0,
           atime: Sun, 21 Nov 2010 04:48:23 GMT,
           mtime: Sun, 21 Nov 2010 04:48:23 GMT,
           ctime: Sun, 21 Nov 2010 04:48:23 GMT,
           name: 'file-2' } ],
      dirs: 
       [ { dev: 234881026,
           ino: 30682244,
           mode: 16893,
           nlink: 4,
           uid: 504,
           gid: 20,
           rdev: 0,
           size: 136,
           blksize: 4096,
           blocks: 0,
           atime: Sun, 21 Nov 2010 04:49:40 GMT,
           mtime: Sun, 21 Nov 2010 04:48:23 GMT,
           ctime: Sun, 21 Nov 2010 04:48:23 GMT,
           name: 'dir1' } ],
      blocks: [],
      chars: [],
      links: [],
      fifos: [],
      sockets: [] }
    PATH: walk-test/dir1
    SORTED: 
    { errors: [],
      files: 
       [ { dev: 234881026,
           ino: 30682247,
           mode: 33204,
           nlink: 1,
           uid: 504,
           gid: 20,
           rdev: 0,
           size: 0,
           blksize: 4096,
           blocks: 0,
           atime: Sun, 21 Nov 2010 04:48:23 GMT,
           mtime: Sun, 21 Nov 2010 04:48:23 GMT,
           ctime: Sun, 21 Nov 2010 04:48:23 GMT,
           name: 'file-1' },
         { dev: 234881026,
           ino: 30682248,
           mode: 33204,
           nlink: 1,
           uid: 504,
           gid: 20,
           rdev: 0,
           size: 0,
           blksize: 4096,
           blocks: 0,
           atime: Sun, 21 Nov 2010 04:48:23 GMT,
           mtime: Sun, 21 Nov 2010 04:48:23 GMT,
           ctime: Sun, 21 Nov 2010 04:48:23 GMT,
           name: 'file-2' } ],
      dirs: [],
      blocks: [],
      chars: [],
      links: [],
      fifos: [],
      sockets: [] }
