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

    //Serialize executes 1 request at a time, instead of running everything in parallel
    db.serialize(function() {

        test.test('Stats-inc#Loaded db', function() {
            (db.filename).should.equal(dbName);
        });

        test.countRows("stats", 0);
        
        stats.inc("/folder", "song", "mp3");
        test.countRows("stats", 1);
        db.get("SELECT * FROM stats ORDER BY count ASC", [], function(err, song){
             (song.count).should.equal(1);
            (song.name).should.equal("song");
        });
        stats.inc("/folder", "song", "mp3");
        test.countRows("stats", 1);
        db.get("SELECT * FROM stats ORDER BY count ASC", [], function(err, song){
             (song.count).should.equal(2);
            (song.name).should.equal("song");
        });
        stats.inc("/folder", "song2", "mp3");
        test.countRows("stats", 2);
        db.get("SELECT * FROM stats ORDER BY count ASC", [], function(err, song){
             (song.count).should.equal(1);
            (song.name).should.equal("song2");
        });
    });

};

dbUtils.init(startTest);

console.log();