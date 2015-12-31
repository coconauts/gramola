var utils = require('../helpers/utils.js');
var googleImages = require('../services/google-images.js');
var images = require('../models/images.js');

module.exports = {
  routes:  function(app){

      app.get('/images/search',  function(req,res){
          if (!utils.loginRequired(req,res)) return;

          googleImages.search(req.query.n, function(error, url){
            if (error) log.error(error);
            res.json({error: error, url: url, source: "google"});
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
