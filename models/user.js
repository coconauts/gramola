var utils = require('../helpers/utils.js');

var logFactory = require('../helpers/log.js');
var log = logFactory.create("models/user");

var count = function(callback) {
    db.get("select count(*) as count from users", [], function(err, row) {
        callback(row.count);
    });
}

var getUser = function(name, pass, callback) {
    log.debug("Tying to login with user: " + name + ", pass: " + pass);
    db.get("select * from users WHERE user = ? AND password = ?", [name, pass], function(err, user) {

        if (err) log.error("getUser", err);
        log.debug("Logged as ", user);
        return callback(user);
    });
}

var list = function(callback){

    db.all("select id,user from users", [], function(err, row) {
        if (err) log.error("list", err);
        callback(row);
    });
}
var registerSession = function(user, req) {

    log.info("User '" + user.user + "' logged in");
    req.session.username = user.user;
    req.session.lastLogin = new Date().getTime();
    req.session.admin = user.admin;
    req.session.id = user.id;
}

var add = function(name, pass, admin, callback){
    db.serialize(function() { //Execute sync requests
        db.run("INSERT INTO users (user, password, admin) values (?,?,?)", [name, pass, admin]);
        db.get("select * from users ORDER BY id DESC LIMIT 1", [], function(err, user) {
            log.info("New user '" + user.user + "' created with id " + user.id);
            callback(user);
        });
    });
}

module.exports = {
    list: list,
    add: add,
    getUser: getUser,
    count: count,
    registerSession: registerSession

}
