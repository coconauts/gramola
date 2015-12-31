var utils = require('../helpers/utils.js');
var logFactory = require('../helpers/log.js');
var log = logFactory.create("controllers/link");

module.exports = {

    search:  function (name, callback/*(error, url)*/ ) {

      var host = 'ajax.googleapis.com';
      var path = encodeURI("/ajax/services/search/images?safe=off&v=1.0&rsz=1&q="+name);

      log.info("Requesting google image http://"+ host+"/"+path);
      //Url is located in: json.responseData.results[0].url
      var parseUrl = function(error, json){
        if (error) callback(error); //error propagation
        else callback(false, json.responseData.results[0].url);
      };
      utils.getRequest(host, path,parseUrl, "json");
   }
};
