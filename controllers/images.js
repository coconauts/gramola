var utils = require('../helpers/utils.js');

var logFactory = require('../helpers/log.js');
var log = logFactory.create("controllers/images");

var bing;
if (config.BING_API_KEY)  bing = require('node-bing-api')({ accKey: config.BING_API_KEY });
else log.error("Couldn't find config.BING_API_KEY, image service not available");

var images = require('../models/images.js');

module.exports = {
  routes:  function(app){

      app.get('/images/search',  function(req,res){
          if (!utils.loginRequired(req,res)) return;

          if (!bing) {
            var msg =  "Bing service is not available, did you setup config.BING_API_KEY ?";
            log.warn(msg);
            res.json({error: msg});
            return;
          }

          log.info("Requesting image in bing: "+req.query.n);
          bing.images(req.query.n, {
            top: 1,  // Number of results (max 50)
          //  skip: 3,   // Skip first 3 results
          }, function(error, result, body){
            var thumbnail = "";
            if (error) log.error(error);
            else {
              try {
                thumbnail = body.d.results[0].Thumbnail.MediaUrl;
                res.json({error: error, url: thumbnail, source: "bing"});
              } catch (e) {
                var msg = "Unable to get image from Bing: "  + e;
                log.error(msg, body);
                res.json({error: msg });
              }
            }
          });
      });



      app.get('/images/download',  function(req,res){
          if (!utils.loginRequired(req,res)) return;

          var url =  req.query.u;
          var folder = req.query.f;

          images.save(url, folder, function(json){
            if (json.error) console.error(json.error);
            res.json(json);
          });
      });
    }
};
