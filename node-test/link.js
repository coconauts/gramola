var should = require('should'), //http://unitjs.com/guide/should-js.html
    link = require("../models/links.js"),
    sqlite3 = require("sqlite3"),
    dbUtils = require("../models/db.js"),
    now = new Date().getTime(),
    dbName = "/tmp/" + now + ".db",
    test = require('./test.js');

global.db = new sqlite3.Database(dbName);

var startTest = function() {

    //Serialize executes 1 request at a time, instead of running everything in parallel
    db.serialize(function() {

        test.test('Link#Loaded db', function() {
            (db.filename).should.equal(dbName);
        });

        link.add("/song.mp3", function(link) {
            test.test('Link#Get inserted link id 1', function() {
                should(link.id).eql(1);
            });
        });
        
        link.add("/song2.mp3", function(link) {
            test.test('Link#Get inserted link id 2', function() {
                should(link.id).eql(2);
            });
        });
       
    });
};

dbUtils.init(startTest);

console.log();