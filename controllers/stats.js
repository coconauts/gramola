var utils = require('../helpers/utils.js');
var stats = require('../models/stats.js');

var logFactory = require('../helpers/log.js');
var log = logFactory.create("controllers/stats");

var populateInProgress = false;

module.exports = {
  
  routes: function(app){

    app.get('/stats/total',  function(req,res){    
        if (!utils.loginRequired(req,res)) return;
        
        stats.totalSongs(function(int){
        res.json({total: int});   
        });
    })
    
    app.get('/stats/popular',  function(req,res){    
        if (!utils.loginRequired(req,res)) return;
        
        var limit = utils.getOrElse(req.query.l,10);
        limit = parseInt(limit);
        stats.popular(limit, undefined, "DESC", function(songs){
        res.json({songs: songs});   
        });
    })
    
    app.get('/stats/never-played',  function(req,res){    
        if (!utils.loginRequired(req,res)) return;
        
        var limit = utils.getOrElse(req.query.l,10);
        limit = parseInt(limit);
        stats.neverPlayed(limit, undefined, function(songs){
        res.json({songs: songs});   
        });
    })
    
    app.get('/stats/populate',  function(req,res){    
        if (!utils.loginRequired(req,res)) return;
        
        if (populateInProgress) {
            log.info("Populate in progress");
            res.json({status: "Populate in progress"});    
        } else {
            populateInProgress=true;
            log.info("Stats populate");
            stats.populate(function(songs){
                log.info("Populating finished, indexed "+songs.length+ " songs");
                populateInProgress = false;
            });
            res.json({status: "Populating"});
        }        
    })
    
    app.get('/stats/new',  function(req,res){    
        if (!utils.loginRequired(req,res)) return;
        
        var limit = utils.getOrElse(req.query.l,10);
        limit = parseInt(limit);
        stats.newSongs(limit, function(songs){
        res.json({songs: songs});   
        });
    });
  }
}