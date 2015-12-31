var woal = require('../models/woal.js');
var utils = require('../helpers/utils.js');

module.exports = {

    routes: function(app) {
        app.get('/woal/list',  function(req,res){
            if (!utils.loginRequired(req,res)) return;
            
            woal.list(function (err,woals){
                res.json({files:woals});   
            });
        })
    }
}
