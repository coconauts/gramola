//dependencies
var express = require("express"),
    bodyParser = require('body-parser'),
    http = require('http'),
    app = express(),
    session = require('cookie-session'),
    sqlite3 = require("sqlite3").verbose(),
    compressor = require('node-minify'), //https://github.com/expressjs/cookie-session
    favicon = require('serve-favicon');
var fs = require('fs'),
    path = require('path');

/**
 *  == Load DEFAULT CONFIG ==
 */

try {
  var env = require('node-env-file');
  env(process.cwd() + '/.env');
} catch(err){}
global.config = process.env;

var dbSettings = require('./models/settings.js');

var logFactory = require('./helpers/log.js');
var log = logFactory.create("app");

var loadIfMissing = function(c, value){
  if (!config[c]) {
    log.info(c+ " not defined on config, using default "+value);
    config[c] = value;
  }
};

loadIfMissing("DB", "./gramola.db");
loadIfMissing("PORT", 8890);
loadIfMissing("REFRESH_FREQ", 36000000);
loadIfMissing("MAX_FILES", 50);

var dbDirectory = path.dirname(config.DB);
fs.exists(dbDirectory, function(exists){
  if(!exists){
    log.error("Can't access DB directory: "+dbDirectory);
    process.exit(1);
  } else {
    log.info("Using DB path: "+config.DB);
  }
});

global.db = new sqlite3.Database(config.DB);

if (!config.ROOT) {
 log.info("ROOT variable not set in config");
  dbSettings.get(0,"music-folder", function(folder){
    if (!folder) {
      log.info("ROOT variable not set in DB, using /tmp");
      config.ROOT = "/tmp";
    } else {
      log.info("Loading ROOT from DB: "+folder.value);
      config.ROOT = folder.value;
    }
  });
} else {
 log.info("ROOT variable set in config: "+config.ROOT);
}

if (config.DEBUG) log.debug("Running node.js server in DEBUG mode");

/**
 *  == Load models ==
 */
var dbUtils = require('./models/db.js');

dbUtils.init(function(){});

/**
 *  == Load utils ==
 */
var utils = require('./helpers/utils.js');

compressor.minify({
  compressor: 'gcc',
  input: 'public/js/gramola/*.js', 
  //fileIn: files,
  output: 'public/js/gramola.min.js',
  callback: function(err, min){
    if (err) log.error("Unable to minify JS", err);
  }
});

//app.use(express.static(__dirname + '/public'));
//Do not export everything (keep index.html out so we can intercept / endpoint)
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser());
app.use(session({
  keys: ["coconauts"]
}));

/**
 *  == Load controllers ==
 */
require('./controllers/woal.js').routes(app);
require('./controllers/user.js').routes(app);
require('./controllers/link.js').routes(app);
require('./controllers/collection.js').routes(app);
require('./controllers/bucket.js').routes(app);
require('./controllers/settings.js').routes(app);
require('./controllers/lyrics.js').routes(app);
require('./controllers/stats.js').routes(app);
require('./controllers/player.js').routes(app);
require('./controllers/images.js').routes(app);
require('./controllers/setup.js').routes(app);

app.listen(config.PORT);
log.info("Server started in http://localhost:"+config.PORT);
