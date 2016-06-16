var utils = require('../helpers/utils.js');
var stats = require('../models/stats.js');

var logFactory = require('../helpers/log.js');
var log = logFactory.create("models/collection");

var search = function(path, max, type, callback) {
    var typesql = " (type = 'song' OR type = 'folder') ";
    if (type == "song") typesql = " type = 'song' "; //not free-input
    else if (type == "folder") typesql = " type = 'folder' ";

    var sql = "SELECT folder,name,ext,type FROM collection " +
        " WHERE " +
        " (folder like '%" + path + "%' OR name like '%" + path + "%') " +
        " AND " +
        typesql +
        " ORDER BY type ASC LIMIT ?";

        log.info("Search: "+sql +", max "+ max);
        db.all(sql, [max], function(err, songs) {
            callback(err, songs);
        });
}
var imageSearch = function(path, max, callback) {
    var filterDisc = utils.removeDiscs(path),
        query = "SELECT folder,name,ext,type FROM collection " +
        " WHERE folder like '" + filterDisc + "%' " +
        " AND type = 'image'" +
        " ORDER BY folder " +
        " LIMIT ? ";
    db.all(query, [max], function(err, images) {
        callback(images);
    });
}

//Sync deletion
//@deprecated
var truncate = function(callback) {

    db.run("DELETE FROM collection", function() {
        db.run("DELETE FROM SQLITE_SEQUENCE WHERE name='collection'", function() {
            callback();
        });
    });
}

var insertSingle = function(file, callback) {
    db.run("INSERT INTO collection (folder, name, ext, type, created) VALUES (?,?,?,?,?)", [file.folder, file.name, file.ext, file.type, new Date().getTime()], function(err) {
        if (err) log.error("insertSingle",err);
        callback();
    });
}

//Insert async files without duplicates
var insertMultiple = function(files, callback) {
    //TODO Split insert in MAX elements (e.g: a different insert every 100 files)

    var INSERT_FREQ = 100;
    var sql , sep, now, args;

    var initQuery = function(){
       sql = "INSERT OR IGNORE INTO collection (folder, name, ext, type, created) VALUES ";
       sep = "";
       now = new Date().getTime();
       args = [];
    }
    var runQuery = function(callback){
        db.run(sql, args, function(err) {
            if (err) log.error("insertMultiple",err);
            callback();
        });
    }

    initQuery();
     db.serialize(function() {

        for (var i=0 ; i < files.length; i++){
            var file = files[i];
            //var values = "('"+file.folder+"','"+ file.name+"','"+ file.ext+"','"+ file.type+"',"+ now +")";
            var values = "(?,?,?,?,?)";

            args.push(file.folder);
            args.push(file.name);
            args.push(file.ext);
            args.push(file.type);
            args.push(now);

            sql += sep+ values;
            sep =", ";

            if ((i+1)%INSERT_FREQ == 0 && i < files.length -1) {
                log.info("Committing after "+INSERT_FREQ+" files");
                runQuery(function(){});
                initQuery();
            }
        }

        runQuery(callback);
     });
}
var random = function(n, type, folder, sort, callback) {
      db.all(
        "SELECT folder,name,ext,type FROM collection WHERE type = ? AND folder like '"
        + folder + "%' ORDER BY RANDOM()  LIMIT ? ", [type, n], function(err, ids) {
          if (err) log.error("random",err);
          callback(err, ids);
      })
}

module.exports = {
    search: search,
    imageSearch: imageSearch,
    insertMultiple: insertMultiple,
    random: random
}
