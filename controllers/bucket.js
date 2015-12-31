var utils = require('../helpers/utils.js');
var buckets = require('../models/buckets.js');

var fs = require('fs');
var env = require('node-env-file');
    
try {
 env(process.cwd() + '/.env');
} catch(err){}     
    
module.exports = {
  
  routes: function(app){
    app.get('/bucket/list',  function(req,res){
    if (!utils.loginRequired(req,res)) return;
        
        var category = req.query.c,
            user = utils.getOrElse(req.query.u, req.session.id),
            files = [];
        
        buckets.list(category,user, function(files){
            res.json({category: category, files: files});   
        });
    })
    
    app.get('/bucket/set',  function(req,res){
    if (!utils.loginRequired(req,res)) return;
        
        var bucket = {
            user: req.session.id,
            folder: req.query.f,
            name: req.query.n,
            ext: req.query.e,
            category: req.query.c
        };
        
        buckets.insert(bucket);
        res.end();
    });
    
    app.get('/bucket/toggle',  function(req,res){
    if (!utils.loginRequired(req,res)) return;
        var bucket = {
            user: req.session.id,
            folder: req.query.f,
            name: req.query.n,
            ext: req.query.e,
            category: req.query.c
        };
        
        buckets.toggle(bucket, function(b){
                
            res.json(b);
        });
    });
    
    app.get('/bucket/remove',  function(req,res){
    if (!utils.loginRequired(req,res)) return;
        var bucket = {
            user: req.session.id,
            folder: req.query.f,
            name: req.query.n,
            ext: req.query.e,
            category: req.query.c
        };
            
        buckets.remove(bucket);
        res.end();
    });
    
    //@deprecated
    app.get('/bucket/set_folder',  function(req,res){
    if (!utils.loginRequired(req,res)) return;
        var user = req.session.id;
        var folder = req.query.f;
        var category = req.query.c;
    
        utils.readDirRecursive(process.env.ROOT+folder,function(err, files){
            var songs = files.filter(function(file){
                    return file.type == "song";
            });
            insertMultiple(user,category,songs);
            res.json({error:false, total: song.length, songs: songs});
        });
    });
  }
}