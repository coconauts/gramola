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
    
    var files = 
    [ { ext: 'png', folder: 'multiple', name: 'image', type: 'image' },
      { ext: 'mp3', folder: 'multiple', name: 'song', type: 'song'},
      { ext: 'mp3', folder: '', name: 'song', type: 'song'},
      { ext: 'mp3', folder: 'multiple', name: 'duplicated', type: 'song'}
    ];
    
    console.log("Inserting " + files.length + " files in collection");

    db.serialize(function() {
        collection.insertMultiple(files, function(){});
        test.countRows("collection", 4);
    });
};
  
dbUtils.init(testStart);

console.log();
