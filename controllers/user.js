var utils = require('../helpers/utils.js');
var user = require('../models/user.js');

//TODO make this (count rows) a function on db

module.exports = {

    routes: function(app) {
        app.get('/user/is_logged', function(req, res) {

            res.json({
                logged: utils.isLoggedIn(req),
                lastLogin: req.session.lastLogin,
                user: req.session.username,
                id: req.session.id,
                admin: req.session.admin
            });
        })

        app.get('/user/list', function(req, res) {
            if (!utils.loginRequired(req, res)) return;

            user.list(function(row) {
                res.json({
                    logged: {
                        "user": req.session.username,
                        "id": req.session.id
                    },
                    users: row
                });
            });
        })

        app.get('/user/count', function(req, res) {

            user.count(function(c) {
                res.json({
                    count: c
                });
            });

        });

        app.post('/user/login', function(req, res) {

            var name = req.body.user;
            var pass = req.body.pass;

            user.getUser(name,pass, function(u){
                if (u) {
                    user.registerSession(u, req);
                    res.json({user: u});
                } else {
                    res.json({error: "Invalid user name or password"});
                }
            });
        });

        app.get('/user/logout', function(req, res) {
            if (!utils.loginRequired(req, res)) return;

            req.session = null;
            res.end();
        });
    }
};
