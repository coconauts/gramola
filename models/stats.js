var logFactory = require('../helpers/log.js');
var log = logFactory.create("models/stats");

var totalSongs = function( callback){
    db.get("select count(*) count from collection",[] , function (err, songs){
    if(err) log.error("totalSongs",err);
    callback(songs.count);
  });
};

var neverPlayed = function(limit, folder, callback){
  
  var folderFilter ="";
  if (folder) folderFilter = " AND c.folder like '"+folder+"%' ";
  
  var sql = "select c.folder,  c.name,  c.ext " +
         "FROM collection c "+
         " LEFT JOIN woal w ON c.folder = w.folder AND c.name = w.name AND c.ext = w.ext "+
         " WHERE  w.id IS NULL AND c.type = 'song' "+
   folderFilter+
         "LIMIT ?";
  
  db.all(sql ,[ limit] , function (err, songs){
    if(err) log.error("neverPlayed", err);
    callback(songs);
  });
};

/* @deprecated Use stats table instead*/
var popularWoal = function(limit, folder, order, callback){

  var folderFilter ="";
  if (folder) folderFilter = " AND c.folder like '"+folder+"%' ";

  if(order == "ASC") order = "ASC";
  else order = "DESC";
  
  
  var sql = "select count(*) count, c.folder,  c.name,  c.ext " +
         " FROM collection c "+
         " LEFT JOIN woal w ON c.folder = w.folder AND c.name = w.name AND c.ext = w.ext "+
	 " LEFT JOIN buckets b ON b.folder = w.folder AND b.name = w.name "+
         " WHERE  w.id IS NOT NULL AND c.type = 'song' AND (b.category IS NULL OR b.category <> 'blacklist') "+
	 folderFilter+
	 " GROUP BY w.folder, w.name, w.ext  "+
	 " ORDER BY count " + order+
         " LIMIT ?";

  var start = new Date().getTime();
  db.all(sql ,[ limit] , function (err, songs){
    var end = new Date().getTime();
    log.debug("Popular request took " + (end - start) + " ms, got " +songs.length + " results");    
    if(err) log.error("popular", err);
    callback(songs);
  });
};


var countPlays = function(callback){

  var sql = "select "+
         " case when w.id IS NULL then 0 else count(*) end count, "+ //count if woal exist, else 0
         " c.folder,  c.name,  c.ext " +
         " FROM collection c "+
         " LEFT JOIN woal w ON c.folder = w.folder AND c.name = w.name AND c.ext = w.ext "+
         " WHERE c.type = 'song' "+
         " GROUP BY c.folder, c.name, c.ext  "+
         " ORDER BY count DESC" ;

  var start = new Date().getTime();
  db.all(sql ,[] , function (err, songs){
    if(err) log.error("popular", err);

    var end = new Date().getTime();
    log.debug("count play took " + (end - start) + " ms, got " +songs.length + " results");    
    callback(songs);
  });
};


var newSongs = function(limit, callback){

  db.all("SELECT * FROM collection WHERE type = 'song' ORDER BY created DESC LIMIT ?",[ limit] , function (err, songs){
    if(err) log.error("newSongs",err);
    callback(songs);
  });
};

var inc = function(folder, song, ext) {
    
    var subquery = "SELECT id FROM stats WHERE folder = ? AND name = ? AND ext = ?";
    var count = "SELECT (count(*)+1) FROM stats WHERE folder = ? AND name = ? AND ext = ?";

    var sql = "INSERT OR REPLACE INTO stats (id, folder, name, ext, count) values "+
        "(("+subquery+"), ?, ?, ?, ("+count+") )";
        
    log.debug("INC Sql " + sql);
    db.run(sql, [folder,song,ext, folder,song,ext, folder,song,ext] );
}

var saveMultiple = function(songs, callback) {

    if (songs.length == 0 ) return;
    
    var INSERT_FREQ = 100;
    var sql , sep, args;
    
    var initQuery = function(){
        sql = "INSERT INTO stats (folder, name, ext, count) VALUES ";
        sep = "";
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

        for (var i=0 ; i < songs.length; i++){
            var song = songs[i];
            //var values = "('"+file.folder+"','"+ file.name+"','"+ file.ext+"','"+ file.type+"',"+ now +")";
            var values = "(?,?,?,?)";
                
            args.push(song.folder );
            args.push(song.name);
            args.push(song.ext);
            args.push(song.count);

            sql += sep+ values;
            sep =", ";
            
            if ((i+1)%INSERT_FREQ == 0 && i < songs.length -1) {
                log.info("Committing after "+INSERT_FREQ+" files");
                runQuery(function(){});
                initQuery();
            }
        }
        
        runQuery(callback);
    });
}

var popularStats = function(limit, folder, order, callback){

    var folderFilter ="";
    if (folder) folderFilter = " AND s.folder like '"+folder+"%' ";

    if(order == "ASC") order = "ASC";
    else order = "DESC";
  
    var sql = "SELECT s.* FROM stats s " +
            " LEFT JOIN buckets b ON b.folder = s.folder AND b.name = s.name "+
            " WHERE (b.category IS NULL OR b.category <> 'blacklist') "+
             folderFilter+
            " ORDER BY count " + order+
            " LIMIT ?";
    
    db.all(sql, [limit] , function (err, songs){
        if(err) log.error("popularStats",err);
        callback(songs);
    });

}

var populate = function(callback){

    db.serialize(function(){
        db.run("DELETE FROM stats");
        log.debug("Loading popular songs from woal");
        countPlays(function(songs) {
            log.debug("Saving " + songs.length + " popular songs in stats");
            saveMultiple(songs, function(){
                callback(songs);
            });
        });
    });
}

module.exports = {
    totalSongs: totalSongs,
    popular: popularStats,
    neverPlayed: neverPlayed,
    newSongs: newSongs,
    inc: inc,
    populate: populate
}