var utils = require('../helpers/utils.js');

var logFactory = require('../helpers/log.js');
var log = logFactory.create("controllers/lyrics");

exports.routes = function(app){

  app.get('/lyrics',  function(req,res){
    if (!utils.loginRequired(req,res)) return;

    var song =  req.query.s;

    requestLyricsNMusic(song, function(error, json){
      if (error) log.error(error);
      res.json({error: error, lyric: json});
    });
  });

  var requestLyricsNMusic =  function (song, callback/*error, json*/) {
        //Documentation: http://www.lyricsnmusic.com/api
        //http://api.lyricsnmusic.com/songs?api_key=[YOUR_API_KEY]&track=clocks
        var apiKey = "f9912ac4a0e69e9ab03b94e17d6af5",
            host = 'api.lyricsnmusic.com',
            path = encodeURI("songs?api_key="+apiKey+"&track="+song);

        utils.getRequest(host, path,callback, "json");
    };
};
