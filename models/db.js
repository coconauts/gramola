var logFactory = require('../helpers/log.js');
var log = logFactory.create("models/db");

//Creates directly the database using the latest version, there's no need to apply evolutions
var create = function(callback){
  log.info("Initializing DB schema");
  db.serialize(function() { //serialize will run execute a query at a time
    db.run("CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY AUTOINCREMENT,link TEXT);");    
    db.run("CREATE TABLE IF NOT EXISTS woal (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp NUMERIC, folder TEXT, name TEXT, ext TEXT, type TEXT, ip TEXT, user NUMERIC);");   
    db.run("CREATE TABLE IF NOT EXISTS collection ( id INTEGER PRIMARY KEY AUTOINCREMENT, folder TEXT, name TEXT, ext TEXT, type TEXT);");
    db.run("CREATE TABLE IF NOT EXISTS buckets ( id INTEGER PRIMARY KEY AUTOINCREMENT,user NUMERIC, category TEXT, folder TEXT, name TEXT, ext TEXT, created NUMBER);");
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT UNIQUE, password TEXT, admin NUMERIC);");
    db.run("CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, user NUMERIC, key TEXT, value TEXT);");
    
    db.run("INSERT INTO settings (key,value) VALUES (?,?)", ["version","0"], function(){ applyEvolutions(callback) }); 
  });
};

//Apply changes to database if it gets out of date
var applyEvolutions = function(callback){
  db.get("SELECT * FROM settings WHERE key = 'version'",[] , function (err, setting){
    if (err) log.error("applyEvolutions",err);
    switch(setting.value) {
      case "0": evolution1(function(){applyEvolutions(callback);}); break;
      case "1": evolution2(function(){applyEvolutions(callback);}); break;
      case "2": evolution3(function(){applyEvolutions(callback);}); break;
      case "3": log.info("Database is up to date"); callback(); break; 

      default: log.warn("Unexpected database version", setting.value);
    }
  });
};

var evolution1 = function(callback){
  log.info("Database is out of date, applying evolution 1 ");
  db.serialize(function() {
    db.run("ALTER TABLE collection ADD COLUMN created NUMBER;");
    db.run("UPDATE settings SET value='1' WHERE key='version'", function(){ callback() });
  });
}

var evolution2 = function(callback){
  log.info("Database is out of date, applying evolution 2 ");
   db.serialize(function() {
    db.run("CREATE UNIQUE INDEX unique_file ON collection(folder, name, ext);");
    db.run("UPDATE settings SET value='2' WHERE key='version'", function(){ callback() });

   });
}

var evolution3 = function(callback){
  log.info("Database is out of date, applying evolution 3 ");
   db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY AUTOINCREMENT, folder TEXT, name TEXT, ext TEXT, count NUMERIC);");   
    db.run("UPDATE settings SET value='3' WHERE key='version'", function(){ callback() });

   });
}

var db_init = function(callback){
  //Check if exists
  db.get("SELECT * FROM sqlite_master WHERE name ='settings' and type='table';",function(err, table){
    if (err) log.error("db_init",err); 
    if(table === undefined) create(callback);
    else applyEvolutions(callback);
  });
}

module.exports = {   
  init: db_init
}