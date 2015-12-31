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

    for (var i = 0; i< 1000; i++){
        var w = "song"+(i % 50);
        var file = "/folder/"+w+".mp3";
        woals.push(file);
    }
    
    //Serialize executes 1 request at a time, instead of running everything in parallel
    db.serialize(function() {

        test.test('Stats-populate#Loaded db', function() {
            (db.filename).should.equal(dbName);
        });

        console.log("Inserting " + files.length + " files in collection");

        collection.insertMultiple(files, function(){});
        test.countRows("collection", files.length);

        test.countRows("woal", 0);
        console.log("Inserting " + files.length + " songs in woal");

        woal.saveMultiple(woals, "1", "8.8.8.8");
        /*for(var i=0; i< woals.length; i++){
            var f = woals[i];
            woal.save(f, "1", "8.8.8.8");
        }*/
        
        test.countRows("woal", woals.length);
        
        //test.sample("woal");
        //test.sample("collection");
        stats.populate(function(){
            test.countRows("stats", 100);   
            db.all("SELECT * FROM stats",[], function(err, rows){
                test.test('Stats-populate#Count stats', function() {
                    if (err) console.log(err);
                    (rows[0].name).should.equal("song0");
                    (rows[0].count).should.equal(20);
                    
                    (rows[rows.length-1].name).should.equal("song99");
                    (rows[rows.length-1].count).should.equal(0);
                });
            });
        });
        
    });

};

dbUtils.init(startTest);

console.log();