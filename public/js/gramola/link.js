var link = new Link();

$( document ).ready(function() {
    $("#share_folder").click(function(){
      link.folder();
    })
    $("#share_song").click(function(){
      link.song();
    })
});

function Link(){
  this.song = function song(){
    var currentSong = player.current();
    if (currentSong) { // currentsong != ""
      var link = '?s='+encodeURIComponent(currentSong.file.path);
      this.prompt(link);
    }
  }
  this.folder = function folder(){
    var currentSong = player.current();
    if (currentSong) {
      var link = '?f='+encodeURIComponent(currentSong.file.folder);
      this.prompt(link);
    }
  }
  
  //@synchronous
  this.get = function get(link){
    var json = $.ajax({
        url: 'link/get?l='+link,
        dataType: "json",
        async: false
    }).responseText;
    // TODO: replace text > parse >  url with json.url
    json = JSON.parse(json);
    return json.link;
  }
  
  this.prompt = function prompt(text){
    $.ajax({
        url: 'link/set?l='+encodeURIComponent(text),
        dataType: "json",
        success: function (json) {
            var index_url = location.protocol + '//' + location.host + location.pathname;
            //see preload in utils.js to see the parameter you should use here
            window.prompt ("Copy to clipboard: Ctrl+C, Enter", index_url+"?l="+json.id);
        }
    });
  }
}

