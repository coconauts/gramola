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

function testStart(size, fileType, test){
  console.log("testStart, size " + size);

  const extTypes = ["png", "mp3", "ogg"];

  var entries = [];
  var spread = Math.floor(size/10);

  var path;

  for (i = 0; i < size; i++){
    levelsDeep = Math.floor(Math.random() * spread) + 1;  // prevent 0
    path = [];
    for (j=0; j<levelsDeep; j++){
      path.push( Math.floor(Math.random() * spread));
    }

    entries.push({
      ext: extTypes[Math.floor(Math.random()*extTypes.length)],
      folder: path.join('/'),
      name: "song" + i,
      type: fileType
    });
  }
  console.log("Inserting " + entries.length + " files in collection");
  collection.insertMultiple(entries, function(){test(size * 10)});

}


var randomTest = function(numQueries){
  var counter = 0;
  var registry = {};

  function callRandom(){
    counter ++;
    console.log(counter);
    if (counter > numQueries) {
      return;
    }
    collection.random(1, "song", "", "random", function(err, songs){
      for (var i in songs){
        registry[songs[i]['name']]++;
      }
      setTimeout(callRandom,5000);
    });
  }

  db.all("SELECT name FROM collection",[], function(err, result){
    for (var i in result){
      registry[result[i]['name']] = 0;
    }
    callRandom();
  });

}

dbUtils.init(function(){testStart(100, "song", randomTest)});

console.log();
