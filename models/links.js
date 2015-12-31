var logFactory = require('../helpers/log.js');
var log = logFactory.create("models/links");

var add = function(l, callback) {
    db.serialize(function() { //Execute sync requests
        db.run("INSERT INTO links (link) VALUES (?)",[l]);
        db.get("select * from links ORDER BY id DESC LIMIT 1",[] , function (err, link){
            callback(link);
        });
    });
}

var get = function( l, callback) { 
  db.get("select * from links WHERE id = ?",[l] , function (err, link){
      if (err) log.error(err);
      callback(link);
  });
}

module.exports = {
    get: get,
    add: add
}