var utils = require('../helpers/utils.js');
var settings = require('./settings.js');
var collection = require('../models/collection.js');
var env = require('node-env-file');

var logFactory = require('../helpers/log.js');
var log = logFactory.create("controllers/collection");

try {
    env(process.cwd() + '/.env');
} catch (err) {}

module.exports = {

    routes: function(app) {

        app.get('/collection/refresh', function(req, res) {
            if (!utils.adminRequired(req, res)) return;

            log.info("Force collection refresh");
            refreshCollection();

            res.json({
                error: false
            });
        });

        app.get('/collection/recommendation', function(req, res) {
            res.json({
                error: true,
                msg: "Not supported (yet)"
            });
        });

        app.get('/collection/search', function(req, res) {
            if (!utils.loginRequired(req, res)) return;

            var path = utils.getOrElse(req.query.s, "/").replace(/'/g, "''"),
                type = req.query.t;

            collection.search(path, process.env.MAX_FILES, type, function(err, songs) {
                res.json({
                    error: err,
                    files: songs
                });
            });
        });

        app.get('/collection/images', function(req, res) {
            if (!utils.loginRequired(req, res)) return;

            var path = utils.getOrElse(req.query.f, "/").replace(/'/g, "''");

            collection.imageSearch(path, 5, function(images) {
                res.json({
                    files: images
                });
            })
        });
        app.get('/collection/random', function(req, res) {
            if (!utils.loginRequired(req, res)) return;

            var n = utils.getOrElse(req.query.n, 1),
                type = (req.query.folder === undefined) ? "song" : "folder", //boolean parameter
                folder = utils.getOrElse(req.query.f, "/").replace(/'/g, "''"),
                sort = utils.getOrElse(req.query.s, "random");

            collection.random(n, type, folder, sort, function(err, json) {
                if (err) log.error("random", err);
                res.json({
                    error: err,
                    files: json
                });
            });

        });

        var refreshCollection = function() {
            log.debug("Refreshing song collection at " + new Date());
            var init = new Date().getTime(),
                time = (new Date().getTime() - init);

            utils.readDirRecursive(process.env.ROOT, "/", function(err, files) {
                log.debug("Recursive read with " + files.length + " files, took: " + time + " ms");

                //Do not use truncate, as the list of songs is static now
                //truncate(function(){

                collection.insertMultiple(files, function() {});
                time = (new Date().getTime() - init);
                log.info("Collection refreshed with " + files.length + " files, took: " + time + " ms");
                //});

            });
        }

        var refresh = utils.getOrElse(process.env.REFRESH_FREQ, 24 * 3600 * 1000); //every day
        log.info("Refreshing every " + refresh + " ms");
        setInterval(refreshCollection, refresh);

        //TODO Check all songs in db exist, delete them otherwise
    }
}