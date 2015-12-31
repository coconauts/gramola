var should = require('should'), //http://unitjs.com/guide/should-js.html
    sqlite3 = require("sqlite3"),
    dbUtils = require("../models/db.js"),
    woal = require("../models/woal.js"),
    stats = require("../models/stats.js"),
    collection = require("../models/collection.js"),
    buckets = require("../models/buckets.js"),
    now = new Date().getTime(),
    dbName = "/tmp/" + now + ".db",
    test = require('./test.js');

global.db = new sqlite3.Database(dbName);

console.log("Running DB tests");

var startTest = function() {

    var files =[], woals = [];
    for (var i = 0; i< 100; i++){
        var songName = "song"+i;
        var file = { ext: 'mp3', folder: '/folder', name: songName, type: 'song'};
        files.push(file);
    }

    for (var i = 0; i< 10000; i++){
        var w = "song"+(i % 50);
        var file = "/folder/"+w+".mp3";
        woals.push(file);
    }
    
    //Serialize executes 1 request at a time, instead of running everything in parallel
    db.serialize(function() {

        test.test('Stats-speed#Loaded db', function() {
            (db.filename).should.equal(dbName);
        });

        console.log("Inserting " + files.length + " files in collection");

        collection.insertMultiple(files, function(){});
        test.countRows("collection", files.length);

        test.countRows("woal", 0);
        console.log("Inserting " + files.length + " songs in woal");

        woal.saveMultiple(woals, "1", "8.8.8.8");
        
        test.countRows("woal", woals.length);
        
        stats.populate(function(){
            //test.countRows("stats", 100); 
            var start = new Date().getTime();
            //test.sample("stats");
            stats.popular(10, "/", "ASC", function(songs) {
                var end = new Date().getTime();
                console.log("Populate test took " + (end -start) + " ms");
                test.test('Stats-speed#Count popular 10', function() {
                    (songs.length).should.equal(10);
                    (songs[0].count).should.equal(0);
                    (end -start).should.not.be.above(100);
                });
            });
        });
    });

};

dbUtils.init(startTest);

console.log();