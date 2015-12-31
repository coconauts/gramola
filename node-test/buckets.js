var should = require('should'), //http://unitjs.com/guide/should-js.html
    buckets = require("../models/buckets.js"),
    sqlite3 = require("sqlite3"),
    dbUtils = require("../models/db.js"),
    now = new Date().getTime(),
    dbName = "/tmp/" + now + ".db",
    test = require('./test.js');

global.db = new sqlite3.Database(dbName);

console.log("Running DB tests");

var sizeTest = function(size){
    test.test("Db#List buckets ("+size+")", function() {
        buckets.list("favorite", "1", function(b){
            (b.length).should.equal(size);
        });
    });
}

var startTest = function() {

    //Serialize executes 1 request at a time, instead of running everything in parallel
    db.serialize(function() {

        test.test('Buckets#Loaded db', function() {
            (db.filename).should.equal(dbName);
        });

        sizeTest(0);
        
        test.test('Db#Insert bucket', function() {
            var b = {user: "1", folder: "/folder", name: "song.mp3", ext: "mp3", category: "favorite"};
            buckets.insert(b, function(){});
        });
        
        sizeTest(1);
        
         test.test('Db#List different user (0)', function() {
            buckets.list("favorite", "2", function(b){
                (b.length).should.equal(0);
            });
        });
        
        test.test('Db#Toggle bucket', function() {
            var b = {user: "1", folder: "/folder", name: "song.mp3", ext: "mp3", category: "favorite"};
            buckets.toggle(b, function( bu){
                (bu.folder).should.equal(b.folder);
                
                sizeTest(0);

            });
        });
        
        
    });
};

dbUtils.init(startTest);

console.log();