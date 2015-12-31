/**
 * Bucket type
   class Bucket(user, folder, name, ext, category)
*/
var logFactory = require('../helpers/log.js');
var log = logFactory.create("models/buckets");

var list = function(category, user, callback) {
    db.all("SELECT * FROM buckets WHERE category = ? AND user = ? ORDER BY id DESC",[category, user], function (err,buckets){
        var files = [];
        for (var i=0;i<buckets.length;i++){
            var bucket = buckets[i];
            files.push({
                name: bucket.name,
                folder: bucket.folder,
                ext: bucket.ext,
                type: "song"
            });
        }
        callback(files);
    });
}

var insert = function(b, callback){
    log.debug("Inserting bucket " + JSON.stringify(b));
    db.run("INSERT INTO buckets (user,category,folder,name,ext) VALUES (?,?,?,?,?)", 
           [b.user,b.category,b.folder,b.name,b.ext],  
           function(err) {
                if (err) log.error("insert",err);
                callback(b);
           }
    );
}
var remove = function(b, callback){
    log.debug("Removing bucket " + JSON.stringify(b));
    db.run("DELETE FROM buckets WHERE user = ? AND folder = ? AND name = ? AND ext = ? AND category = ?", 
           [b.user,b.folder,b.name,b.ext,b.category],  
           function(err) {
                if (err) log.error("remove",err);
                get(b, function(bu){});
                callback(b);
            }
    );
}

var get = function(b, callback) {

    db.get("SELECT * FROM buckets WHERE user = ? AND category = ? AND folder = ? AND name = ? AND ext = ?",  
           [b.user,b.category,b.folder,b.name,b.ext], 
           function(err, bucket){
               if (err) log.error("get", err);
               callback(bucket);
           }
    );
}
var insertMultiple = function(user,category,files){
    //TODO Split insert in MAX elements (e.g: a different insert every 100 files)
    //TODO Not sure if this serialize inserts all elements in one transaction (is db.prepare ?)
    db.serialize(function() {
        files.forEach(function(file) {
        log.debug("Inserting "+category+" song: "+file.name);
        db.run("INSERT INTO buckets (user,category,folder, name, ext) VALUES (?,?,?,?,?)", [user,category,file.folder,file.name,file.ext]); });
    });
}

var toggle = function(b, callback) {
    db.serialize(function() {
        get(b, function(bucket) {
            if (bucket) remove(bucket, callback);
            else insert(b, callback);
        });
    });
}
module.exports = {
    insert: insert,
    remove: remove,
    insertMultiple: insertMultiple,
    toggle: toggle,
    list: list
}