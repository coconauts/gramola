var utils = require('../helpers/utils.js');
var settings = require('../models/settings.js');

module.exports = {
  
  routes: function(app){

        app.get('/settings/list',  function(req,res){    
            if (!utils.loginRequired(req,res)) return;
            
            settings.list(req.session.id, function(settings){
            res.json({settings: settings});   
            });
        })
        
        app.get('/settings/get',  function(req,res){    
            if (!utils.loginRequired(req,res)) return;
            
            settings.get(req.session.id,req.query.k,function(settings){
            res.json(settings);
            });
        })
        app.get('/settings/set',  function(req,res){
            if (!utils.loginRequired(req,res)) return;
                
            var key = req.query.k,
                value = req.query.v,
                user = req.session.id;

            settings.set(user,key,value, function(){});
            res.end();
            
        });
    }
}