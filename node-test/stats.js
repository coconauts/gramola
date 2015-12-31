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

        test.test('Stats#Loaded db', function() {
            (db.filename).should.equal(dbName);
        });

        var files = [
            { ext: 'png', folder: '/folder', name: 'image', type: 'image' },
            { ext: 'mp3', folder: '/folder', name: 'song', type: 'song'},
            { ext: 'mp3', folder: '/', name: 'song', type: 'song'},
            { ext: 'mp3', folder: '/folder', name: 'song2', type: 'song'},
            { ext: 'mp3', folder: '/folder', name: 'song3', type: 'song'}
        ];


        console.log("Inserting " + files.length + " files in collection");

        collection.insertMultiple(files, function() {});
        test.countRows("collection", 5);

        test.countRows("woal", 0);


        stats.neverPlayed(10, undefined, function(songs) {
            test.test('Stats#Never played: all', function() {
                (songs.length).should.equal(4); //only songs
            });
        });

        stats.neverPlayed(10, "/folder", function(songs) {
            test.test('Stats#Never played: filter by folder', function() {
                (songs.length).should.equal(3); //only songs in folder
            });
        });

        woal.save("/folder/song.mp3", "1", "8.8.8.8");

        //test.countRows("woal", 1); 
        //woal.list(function(err, rows) { console.log(rows);});

        stats.neverPlayed(10, "/folder", function(songs) {
            test.test('Stats#Never played: with woal', function() {
                (songs.length).should.equal(2); //only songs in folder - woal
            });
        });

        stats.popular(10, "/", "ASC", function(songs) {
            test.test('Stats#Popular', function() {
                (songs.length).should.equal(1);
                (songs[0].name).should.equal("song");
                (songs[0].count).should.equal(1);
            });
        });

        woal.save("/folder/song2.mp3", "1", "8.8.8.8");
        buckets.insert({
            user: "1",
            folder: "/folder",
            name: "song2",
            ext: "mp3",
            category: "favorite"
        }, function() {});


        stats.popular(10, "/folder", "DESC", function(songs) {
            test.test('Stats#Popular: favorite', function() {
                (songs.length).should.equal(2);
            });
        });

        woal.save("/folder/song2.mp3", "1", "8.8.8.8");

        stats.popular(10, "/folder", "DESC", function(songs) {
            test.test('Stats#Popular: sort', function() {
                console.log(songs);
                (songs.length).should.equal(2);
                (songs[0].name).should.equal("song2");
                (songs[0].count).should.equal(2);
                (songs[1].name).should.equal("song");
                (songs[1].count).should.equal(1);
            });
        });

        buckets.insert({
            user: "1",
            folder: "/folder",
            name: "song",
            ext: "mp3",
            category: "blacklist"
        }, function() {});

        stats.popular(10, "/folder", "ASC", function(songs) {
            test.test('Stats#Popular: blacklist', function() {
                (songs.length).should.equal(1); //only songs in folder - woal
                (songs[0].name).should.equal("song2");
                (songs[0].count).should.equal(2);
            });
        });

    });
};

dbUtils.init(startTest);

console.log();