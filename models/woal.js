var utils = require('../helpers/utils.js');
var stats = require('./stats.js');

var logFactory = require('../helpers/log.js');
var log = logFactory.create("models/woal");

var list = function(callback){
    db.all("SELECT * FROM woal ORDER BY id DESC LIMIT ?",[50], function (err,woals){
      //TODO Include values in file.desc field (like IP or user)  
      if (err) log.error("list",error);
      callback(err, woals);
    });
};


var save = function (song, userId, ip){
  
  var folder = utils.getFolder(song),
      file = utils.removeFolder(song),
      name = utils.removeExtension(file),
      ext = utils.getExtension(file),
      type = utils.getType(file);
  
  //Folder needs to be stored in the same format that collection
  //If a folder appears with a trailing slash, you can remove it with
  //  UPDATE woal SET folder = SUBSTR(folder, 1, LENGTH(folder)-1);
  if (type === "song") {
    log.debug("Inserting woal " + folder + " "+ name + " " + ext);

    db.run("INSERT INTO woal (timestamp,folder,name,ext,type,ip,user) values (?,?,?,?,?,?,?)",
         [new Date().getTime(), folder,name,ext,"song", ip, userId]);
    stats.inc(folder,name, ext);

  }
}

//used in tests
var saveMultiple = function(files, userId, ip) {
    //TODO Split insert in MAX elements (e.g: a different insert every 100 files)

    var INSERT_FREQ = 100;
    var sql , sep, now, args;
    
    var initQuery = function(){
       sql = "INSERT INTO woal (timestamp,folder,name,ext,type,ip,user) values ";
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
            var song = files[i];
            //var values = "('"+file.folder+"','"+ file.name+"','"+ file.ext+"','"+ file.type+"',"+ now +")";
            var values = "(?,?,?,?,?,?,?)";
            var folder = utils.getFolder(song),
                file = utils.removeFolder(song),
                name = utils.removeExtension(file),
                ext = utils.getExtension(file),
                type = utils.getType(file);
                
            args.push(new Date().getTime() );
            args.push(folder);
            args.push(name);
            args.push(ext);
            args.push("song" );
            args.push(ip  );
            args.push(userId );

            sql += sep+ values;
            sep =", ";
            
            if ((i+1)%INSERT_FREQ == 0 && i < files.length -1) {
                //log.info("Committing after "+INSERT_FREQ+" files");
                runQuery(function(){});
                initQuery();
            }
        }
        
        runQuery(function(){});
     });
}

module.exports = {
    list: list,
    save: save,
    saveMultiple: saveMultiple ////used in tests
}