var should = require('should'), //http://unitjs.com/guide/should-js.html
    sqlite3= require("sqlite3"),
    dbUtils= require("../models/db.js"),
    utils= require("../helpers/utils.js"),
    now = new Date().getTime(),
    dbName = "/tmp/"+now+".db",
   collection= require("../models/collection.js"),
   test = require('./test.js');
    
global.db = new sqlite3.Database(dbName);

console.log("Running Collections tests");

var testStart = function(){
    
    var files =[], files2 = [];
    for (var i = 0; i< 100; i++){
        var songName = "song"+i;
        var file = { ext: 'mp3', folder: '/', name: songName, type: 'song'};
        files.push(file);
    }
    
    for (var i = 100; i< 500; i++){
        var songName = "song"+i;
        var file = { ext: 'mp3', folder: '/', name: songName, type: 'song'};
        files2.push(file);
    }
    
    console.log("Inserting " + files.length + " files in collection");

    var start = new Date().getTime();
    collection.insertMultiple(files, function() {
        var end = new Date().getTime();
        console.log("Indexing took " + (end - start) +" ms");
        test.countRows("collection", files.length);
        //Do it again (avoid duplicates)
        collection.insertMultiple(files, function() {
            test.countRows("collection", files.length);
            //Insert set 2
            collection.insertMultiple(files2, function() {
                test.countRows("collection", files.length + files2.length);
            });
        });
    });

  };
  
dbUtils.init(testStart);


console.log();
