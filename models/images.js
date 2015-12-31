var utils = require('../helpers/utils.js');
var fs = require('fs');
var http = require('http');
var env = require('node-env-file');

module.exports = {

    save: function(imgUrl, path, callback){

      var root = process.env.ROOT;

      var extension = ".jpg";
      if (imgUrl.contains("png")) extension= ".png";
      else if (imgUrl.contains("bmp")) extension = ".bmp";
      else if (imgUrl.contains("gif")) extension = ".gif";

      var filename = path + "/image-"+new Date().getTime() + extension;
      f = fs.createWriteStream(root + filename),

      http.get(imgUrl, function(response) {
          response.pipe(f);
          response.on('data', function() { });
          response.on('end',function(){
            callback({
                error: false,
                path: filename,
                serve: "serve?f="+encodeURIComponent(filename)
            });
        });
      }).on("error", function(e){
          callback({
              error: "Unable to save image from " + imgUrl + " into " + path + ": " + e
          });
      });
    }
};
