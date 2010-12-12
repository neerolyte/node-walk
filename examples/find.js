(function () {
  var walk = require("../lib/walk3.js"),
    emit = walk(process.argv[2] || "/tmp");
    //icount = 0;

  emit.on('directory', function (path, file, next) {
    //icount += 1;
    console.log(path + '/' + file.name); // + " " + icount);
    process.nextTick(next);
    //setTimeout(next, 100);
  });
  /*
  emit.on('file', function (path, file, next) {
    console.log("FILE:", file.name, "\n");
    next();
  });
  emit.on('directory', function (path, dir, next) {
    console.log("DIR:", dir.name, "\n");
    next();
  });
  */
}());

