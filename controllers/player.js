var woal = require('../models/woal.js');
var link = require('../models/links.js');
var utils = require('../helpers/utils.js');
var serve = require('../helpers/serve.js');

var fs = require('fs');

var logFactory = require('../helpers/log.js');
var log = logFactory.create("controllers/player");

module.exports = {

    routes: function(app) {

        app.get('/', function(req, res) {

            //Redirec to serve if unidentified user is requesting a link song
            if (req.query.l && !utils.isLoggedIn(req)) {
                res.writeHead(302, {
                    'Location': 'serve?l=' + req.query.l
                });
                res.end();
            } else {
                fs.readFile('./public/index.html', function(err, data) {
                    res.writeHead(200, {
                        'Content-Type': 'text/html',
                        'Content-Length': data.length
                    });
                    res.write(data);
                    res.end();
                });
            }
        });

        app.get('/serve', function(req, res) {

            //TODO Insert woal on response                             woal.save(file, req.session.id, req.connection.remoteAddress);

            //TODO /serve/:file (req.params.file) looks better than /serve?f= (req.query.f) but it doesn't work (too many slashes ?)

            //TODO Can we compress songs (rate) and images (thumbnails) on the fly if required ?

            var serveResponse = function(err, contentType, name,  data){
                if (err) {
                    log.error("serve", err);
                    res.status(404);
                    res.json(err);
                } else {
                    if (req.session.id) woal.save(file, req.session.id, req.connection.remoteAddress);

                    log.debug("User " + req.session.username + " requested " + file);
                    res.writeHead(200, {
                        'Content-Length': data.length,
                        'Content-Type': contentType,
                        'Content-Disposition': 'filename=' + name
                    });
                    res.write(data);
                    res.end();
                }
            };

            var l = req.query.l;
            if (l) {
                log.debug("Got link " + l);

                link.get(l, function( row) {
                    if (!row) {
                        res.status(404);
                        res.json({ error: "Shared song doesn't exist", arg: l });
                        return;
                    }

                    var fileLink = row.link;
                    log.debug("Got link " + fileLink);
                    if (fileLink.contains('?f=')) {
                        res.json({ error: 'Folder sharing not supported' });
                    } else {
                        var file = decodeURIComponent(fileLink);
                        file = file.replace('?s=', '');
                        log.info("Requested shared link " + l + ": " , row);
                        serve.serve(file, serveResponse);
                    }
                });
            } else if (!utils.loginRequired(req, res)) return;
            else {
                log.debug("Got file " + req.query.f);
                var file = decodeURIComponent(req.query.f);
                serve.serve(file, serveResponse);
            }
        });

        app.get('/ls', function(req, res) {
            if (!utils.loginRequired(req, res)) return;

            var root = process.env.ROOT,
                folder = utils.getOrElse(req.query.f, "/"),
                offset = utils.getOrElse(req.query.o - 0, 0),
                count = 20,
                to = offset + count; //TODO make config

            log.debug("Reading " + root + folder + " from " + offset + " to " + to);
            fs.readdir(root + folder, function(err, dir) {

                if (err) {
                    res.status(404);
                    log.error("ls, Error when reading " + root + folder + " : " , err);
                    res.json({
                        error: "Unable to return file",
                        code: err.code
                    });
                    return;
                }

                var files = [];

                for (var i = offset; i < Math.min(dir.length, offset + count); i++) {
                    var file = dir[i];
                    if (file != '.') files.push(utils.parseFile(root, folder, file));
                }

                files.sort(utils.sortFiles);

                res.json({
                    offset: offset,
                    count: files.length,
                    total: dir.length,
                    folder: {
                        path: folder
                    },
                    files: files
                });
            });

        });

        app.get('/play', function(req, res) {
            if (!utils.loginRequired(req, res)) return;

            var folder = utils.getOrElse(req.query.f, "/");
            utils.readDirRecursive(process.env.ROOT, folder, function(err, files) {
                if (err) {
                    log.error("play, Unable to play "+root + folder + " : ", err);
                    res.json({
                        error: err
                    });
                } else {
                    var files = files.slice(0, process.env.MAX_FILES)
                        .filter(function(file) {
                            return file.type == "song";
                        });
                    res.json({
                        folder: folder,
                        files: files
                    });
                }
            });
        });
    }
}
