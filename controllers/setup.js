var fs = require('fs');
var user = require("../models/user.js");
var settings = require("../models/settings.js");

var logFactory = require('../helpers/log.js');
var log = logFactory.create("controllers/setup");

try {
  var env = require('node-env-file');
  env(process.cwd() + '/.env');
} catch(err){}

module.exports = {

    routes: function(app) {

        app.get('/setup', function(req, res) {

            user.count(function(c) {
                if (c > 0) {
                    res.status(403);
                    log.info("Trying to run setup again");
                    res.writeHead(302, {  'Location': "/" });
                    res.end();
                } else {
                    fs.readFile('./public/setup.html', function(err, data) {
                        res.writeHead(200, {
                            'Content-Type': 'text/html',
                            'Content-Length': data.length
                        });
                        res.write(data);
                        res.end();
                    });
                }
            });
        });

        app.post('/setup', function(req, res) {

            user.count(function(c) {
                if (c > 0) {
                    res.status(403);
                    res.json({
                        error: "Setup can only run once"
                    });
                } else {

                    var name = req.body.name;
                    var pass = req.body.pass;
                    var music = req.body.music;

                    settings.set(0, "music-folder", music, function() {});
                    process.env.ROOT = music;

                    user.add(name, pass, 1, function(u) {
                        //auto login
                        user.registerSession(u, req);
                        res.json({
                            user: user,
                            music: music
                        });
                    });
                }
            });

        });
    }

};
