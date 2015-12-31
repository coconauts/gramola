var utils = require('../helpers/utils.js');
var links = require('../models/links.js');

var logFactory = require('../helpers/log.js');
var log = logFactory.create("controllers/link");

module.exports = {
    routes:  function(app){ 
  
        app.get('/link/set',  function(req,res){
            if (!utils.loginRequired(req,res)) return;
            
            var l = req.query.l;
            links.add(l, function(link){
                log.info("User " + req.session.username + " saved link: " + JSON.stringify(link));
                res.json(link);
            });
        })
        
        app.get('/link/get',  function(req,res){
            log.info("Getting link " + req.query.l, req.query);
            links.get( req.query.l, function ( link){
                res.json(link);
            });
        });
    }
}
