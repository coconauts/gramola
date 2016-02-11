var player = new Jplayer();

$( document ).ready(function() {

    player.load();


    $(".jp-play").click(player.togglePause);

});

function Jplayer(){

  var currentSong ;
  var playlist;
  setInterval(function(){change();},1000);

  var change = function change(){

    if (playlist.playlist.length > 0 ){

        $("#song_info_button").attr("disabled", false);
        var current=playlist.current,
            songURL = playlist.playlist[current].mp3,
            newSong = utils.removeServeFile(decodeURIComponent(songURL));
        if (newSong != currentSong){
            currentSong = newSong;
            updateSong();
	    $("#player-info").slideDown();
        }
        //check if the playlist is stuck because a song is broken
        if (isBroken()){
            console.log("The song "+newSong+" is broken!!");
          //  user.request(); //check if it's broken because session ended
            playlist.next();
        }
    } else {
        currentSong = "";
	$("#player-info").slideUp();
    }
  }

  this.current = function current(){
    return {
      src: currentSong,
      file: utils.file(currentSong)
    };
  }

  var isBroken = function currentSongIsBroken(){
      return $("#jquery_jplayer_1").data("jPlayer").status.waitForLoad;
  }

  this.togglePause = function(){
    var $player = $("#jquery_jplayer_1").data("jPlayer");

    if ($player.status.paused) playlist.play();
    else playlist.pause();
  }

  this.load = function loadPlaylist(){
    //jplayer demo http://www.jplayer.org/latest/demo-02-jPlayerPlaylist/
    playlist = new jPlayerPlaylist({
            jPlayer: "#jquery_jplayer_1",
            cssSelectorAncestor: "#jp_container_1"
        },
        [],
        {
            playlistOptions: {
                enableRemoveControls: true,
                smoothPlayBar: true,
                keyEnabled: true
            },
            //swfPath: "jplayer",
            //http://www.longtailvideo.com/support/jw-player/28836/media-format-support/
            supplied: "mp3, oga", //,m4v,flv
            wmode: "window"
        });
  }

  this.add = function add(title,song){
    var play = playlist.playlist.length == 0;
    title = title.replace(/_/g,' ');
    songUrl = utils.serveFileUrl(song);
    playlist.add({
        title:title,
        mp3:songUrl,
        oga:songUrl
    }, play);
  }

  /* If no arguments, remove all playlist, if an argument, remove that song from the list*/
  this.remove = function remove(pos){
    if (pos) playlist.remove();
    else playlist.remove(pos);
  }
  /* Return the size of the current playlist*/
  this.size = function size(){
    return playlist.playlist.length;
  }
  /* Return the position of the current song in the list*/
  this.pos = function pos(){
    return playlist.current;
  }
}
