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

var logFactory = require('./helpers/log.js');
var log = logFactory.create("app");

var dbSettings = require('./models/settings.js');

/**
 *  == Load DEFAULT CONFIG ==
 */

try {
  var env = require('node-env-file');
  env(process.cwd() + '/.env');
} catch(err){}

var loadIfMissing = function(config, value){
  if (!process.env[config]) {
    log.info(config+ " not defined on config, using default "+value);
    process.env[config] = value;
  }
};

loadIfMissing("DB", "./gramola.db");
loadIfMissing("PORT", 8890);
loadIfMissing("REFRESH_FREQ", 36000000);
loadIfMissing("MAX_FILES", 50);

var dbDirectory = path.dirname(process.env.DB);
fs.exists(dbDirectory, function(exists){
  if(!exists){
    log.error("Can't access DB directory: "+dbDirectory);
    process.exit(1);
  } else {
    log.info("Using DB path: "+process.env.DB);
  }
});

global.db = new sqlite3.Database(process.env.DB);

if (!process.env.ROOT) {
 log.info("ROOT variable not set in config");
  dbSettings.get(0,"music-folder", function(folder){
    if (!folder) {
      log.info("ROOT variable not set in DB, using /tmp");
      process.env.ROOT = "/tmp";
    } else {
      log.info("Loading ROOT from DB: "+folder.value);
      process.env.ROOT = folder.value;
    }
  });
} else {
 log.info("ROOT variable set in config: "+process.env.ROOT);
}

if (process.env.DEBUG) log.debug("Running node.js server in DEBUG mode");

/**
 *  == Load models ==
 */
var dbUtils = require('./models/db.js');

dbUtils.init(function(){});

/**
 *  == Load utils ==
 */
var utils = require('./helpers/utils.js');


//minify js files
//Supervisor will restart in a loop, ignore the min.js file using:
//supervisor -i public/js/gramola.min.js app.js
var gramolaJs = 'public/js/gramola/';
var list = fs.readdirSync(gramolaJs);
var compressType = (process.env.DEBUG)?'no-compress':'gcc';

log.debug("Minifying js with method "+compressType+" in "+ gramolaJs+ ": " + list);
var files = [];
list.forEach(function(file) {
  files.push(gramolaJs+file);
});
new compressor.minify({
  type: compressType,
  fileIn: files,
  fileOut: 'public/js/gramola.min.js',
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

app.listen(process.env.PORT);
log.info("Server started in http://localhost:"+process.env.PORT);