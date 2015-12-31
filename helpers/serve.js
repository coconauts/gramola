var fs = require('fs');
var env = require('node-env-file');
var utils = require('../helpers/utils.js');

var logFactory = require('../helpers/log.js');
var log = logFactory.create("helpers/serve");

try {
 env(process.cwd() + '../env');
} catch(err){}     
    
var serve = function(file, callback) {
    var root = process.env.ROOT;
    var name = utils.removeFolder(file);

    fs.readFile(root + file, function(err, data) {
        if (err) {
            log.error("Unable to return file: " + file + ", error:" , err);
            callback(err);
            
        } else {

            var contentType = 'application/octet-stream';
            if (utils.isSong(file)) contentType = 'audio/mpeg';

            var encodedName = encodeURIComponent(name);
            callback(undefined, contentType, encodedName, data);
        }
    });
}

module.exports = {
    serve: serve
}