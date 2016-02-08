var fs = require('fs'),
http = require('http');

http.globalAgent.maxSockets = 100;

//String contains prototype
String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

module.exports = {

  sortFiles: function (a, b) {
      if (a.type == b.type) return a.name.localeCompare(b.name);
      var order = ["folder", "song", "image", "file"];
      if (order.indexOf(a.type) > order.indexOf(b.type)) return 1;
      else return -1;
    },
  /*@tested
   Return unified structure for files , (Requires full path to check directory)*/
    parseFile: function(root, path, file){
      var isDirectory = fs.lstatSync(root + path +"/"+ file).isDirectory(),
          type = "",
          name = "",
          ext = "";

      if (isDirectory) {
        name = file;
        type = "folder";
      } else  {
        name = this.removeExtension(file);
        ext = this.getExtension(file),
        type = this.getType(file);
      }
      return {
        folder: path,
        name: name,
        ext:  ext,
        type: type,
        desc: undefined
      };
    },
    /*@tested
      Return folder of a full path (NO contains trailing /)*/
    getFolder: function(file) {
        var folderIndex = file.lastIndexOf("/") ;
        return file.substr(0,folderIndex);
    },
    /*@tested*/
    removeFolder: function (file) {
        var folderIndex = file.lastIndexOf("/") ;
        return file.substr(folderIndex+1);
    },
    /*@tested*/
   removeExtension: function (file) {
      if (file.contains(".")) return file.substr(0, file.lastIndexOf('.'));
      else return file;
    },
    getExtension: function (file) {
      if (file.contains(".")) return file.split(".").pop();
      else return "";
    },
    sanitize: function (str)
    {
        str = str.replace(/\(.*\)/g,"");
        str = str.replace(/ - /g,": ");
        str = str.trim();
        return str;
    },

    getOrElse: function(value, valueDefault){
      if (value) return value;
      else return valueDefault;
    },
    getType: function(file){
      if (this.isSong(file)) return "song";
      else if (this.isImage(file)) return "image";
      else return "file";
    },
    isImage: function(file){
      var ext = this.getExtension(file).toUpperCase();
      return (ext === "JPG") ||
             (ext === "PNG") ||
             (ext === "GIF") ||
             (ext === "JPEG");
    },
    isSong: function(file){
      var ext = this.getExtension(file).toUpperCase();
      return (ext === "MP3");
    },
    isLoggedIn: function (req){
      return req.session.username != null;
    },
    readDirRecursive: function(root, dir,done){
      walk(root, dir,done);
    },
    random: function(low,high){
      return Math.floor(Math.random() * (high - low + 1) + low);
    },
    probability: function(chances){
      return this.random(0,100) <= chances;
    },

    loginRequired: function(req,res){
      if ( req.session.id) return true;
      else {
        res.status(403);
        res.json({error: true, msg: "Login required" });
        return false;
      }
    },
    adminRequired: function(req,res){

      if (req.session.admin)  return true;
      else {
        res.status(401);
        res.json({error: true, msg: "Admin required" });
        return false;
      }
    },
    /*@tested
      Remove parent folder of discs (remove trailing /)*/
    removeDiscs: function(folder){

      var discs = ["cd", "disc", "disk"]; //lowercase
      for (var i=0; i < discs.length; i++){
	var disc = discs[i];
	    index = folder.toLowerCase().indexOf("/"+disc);
	if (index > 0) folder = folder.substring(0,index);
      }
      return folder;
    },
    //@deprectaed 
    getRequest : function(host, path, callback, format){

        var startTime = Date.now(),
            uri = host+ '/'+path, //only needed for logs
            data = "",
            options = {
                host: host,
                port: 80,
                path: path,
                agent : false
            };

        http.get(options, function(resp){
            resp.on('data', function(chunk){
                data += chunk;
            });
            resp.on('end', function(){

                if (format == "json") {
                  try{
                      json =  JSON.parse(data);
                      callback(false, json);
                  } catch (e){
                    var msg = "Unable to parse json response " + data +" " + e;
                    callback(msg);
                  }

                } else callback(false, data);
            });
        }).on("error", function(e){
          var msg = "Request "+uri+" returned an error: "+e;
          callback(msg);
        });
   }
};

var walk = function(root, dir ,done){
  var results = [];
  fs.readdir(root + "/" + dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      fs.stat(root + "/" + dir + '/'+file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          results.push({
            folder: dir.replace("//","/"),
            name: file,
            ext:  "",
            type: "folder"
          });
          walk(root, dir + "/"+ file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push({
            folder: dir.replace("//","/"),
            name: module.exports.removeExtension(file),
            ext:  module.exports.getExtension(file),
            type: module.exports.getType(file)
          });
          if (!--pending) done(null, results);
        }
      });
    });
  });
}
