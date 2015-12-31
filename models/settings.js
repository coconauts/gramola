var logFactory = require('../helpers/log.js');
var log = logFactory.create("models/settings");

try {
  var env = require('node-env-file');
  env(process.cwd() + '/.env');
} catch(err){}

//TODO we could implement a cache system for keys
//useful tip about exports http://stackoverflow.com/questions/10462223/call-a-local-function-within-module-exports-from-another-function-in-module-ex
var get =function(user,key, callback){
  db.get("select * from settings WHERE user = ? AND key = ?",[user,key] , function (err, value){
    if(err) log.error("get",err);
    callback(value);
  });
}

var insert = function(user, key , value){
    db.run("INSERT INTO settings (user,key,value) VALUES (?,?,?)",[user,key,value]);
}
var update = function(user, key , value){
    db.run("UPDATE settings SET value=? WHERE user=? AND key = ? ",[value,user,key]);
}
var set = function(user, key , value, callback){
    get(user,key,function(settings){
      log.debug("Updating settings: key "+ key +", user "+ user + ", value '" +settings + "' to '" + value+ "'");
      if (settings) update(user,key,value);
      else insert(user,key,value);
    });
    callback();
}

var list = function(user, callback) {
    db.all("SELECT * FROM settings WHERE user = ?",[user], function (err,settings){
        if (err) log.error("list",err);
        callback(settings);
    });
}

module.exports = {
    get: get,
    set: set,
    list: list
}
