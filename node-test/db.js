var should = require('should'), //http://unitjs.com/guide/should-js.html
    sqlite3 = require("sqlite3"),
    dbUtils = require("../models/db.js"),
    now = new Date().getTime(),
    dbName = "/tmp/" + now + ".db",
    test = require('./test.js');

global.db = new sqlite3.Database(dbName);

console.log("Running DB tests");

var insertCollection = function(){
   var files = 
    [ { ext: 'png', folder: '/folder', name: 'image', type: 'image' },
      { ext: 'mp3', folder: '/folder', name: 'song', type: 'song'},
      { ext: 'mp3', folder: '/', name: 'song', type: 'song'},
      { ext: 'mp3', folder: '/folder', name: 'song2', type: 'song'}
    ];
}

var startTest = function() {

    //Serialize executes 1 request at a time, instead of running everything in parallel
    db.serialize(function() {

      
        test.test('Db#Loaded db', function() {
            (db.filename).should.equal(dbName);
        });

        db.get("SELECT * FROM settings WHERE key = ?", ["foo"], function(err, result) {
            test.test('Db#Get empty value', function() {
                should(result).eql(undefined, "Expected undefined value");
            });
        });
        db.run("INSERT INTO settings (user,key,value) VALUES (?,?,?)", [0, "foo", String(now)], function(err, result) {
            test.test('Db#Insert setting', function() {
                should(err).eql(null, "Expected null error");
            });
        });

        db.get("SELECT count(*) as count FROM settings where key = ?", ["foo"], function(err, result) {
            test.test('Db#Count settings: 1', function() {
                (result.count).should.equal(1);
            });
        });

        db.get("SELECT * FROM settings WHERE key = ?", ["foo"], function(err, result) {
            test.test('Db#Get setting', function() {
                (result.value).should.equal(String(now));
            });
        });
        db.run("DELETE FROM settings WHERE key = ?", ["foo"], function(err, result) {
            test.test('Db#Delete setting', function() {
                should(err).eql(null, "Expected null error");
            });
        });

        db.get("SELECT count(*) as count FROM settings where key = ?", ["foo"], function(err, result) {
            test.test('Db#Count settings: 0', function() {
                (result.count).should.equal(0);
            });
        });
    });
};

dbUtils.init(startTest);

console.log();