$( document ).ready(function() {
    //timeout is required here, otherwise the list will be empty (maybe because loadPlaylist)
    setTimeout(function(){preload();},500);

   $(".eject").click(function(){
        player.remove();
	      infinite.disable();
    });

    if (document.location.hostname == "localhost") $(".jp-mute").click();

});

//TODO: Refactor player.js into a class
function preload(){

    var params =utils.loadParams();
    if (params.l){ //link
	//Not logged users should be identified and redirected by nodejs
        var url = link.get(params.l);
        params = utils.loadParams( url);
    }
    if (params.f){ //folder
        var folder = params.f.replace(/%20/g, " ");
        ls(folder);
        addFolder(folder);
    }
    if (params.s){ //song
        var song = decodeURIComponent(params.s);

	song = song.replace(/%20/g, " ");
	var title = utils.filename(song);

        player.add(title,song);
    }
    if (params.i) { //infinite
       var folder = params.i.replace(/%20/g, " ");
       var sort = params.sort;
       ls(folder);
       infinite.set(folder, sort);
    }
}
function addFolder(folder){

     $.ajax({
        url: "play?f="+folder,
        dataType: "json",
        success: function (json) {
            addSongFromFiles(json);
        }
    });
}

function addSongFromFiles(json){

    for(var i=0;i<json.files.length;i++){
        var file = json.files[i],
            filename = file.folder+"/"+file.name+"."+file.ext;

	          console.log("Loading song " + filename);

        filename = filename.replace("//","/");

        if (bucketContains('blacklist', file) ) console.log("Blacklisted song: "+filename);
        else player.add(file.name,filename);
    }
}

function ls(folder,offset) {
    if (folder==null) folder= "/";
    var off = "";
    if (offset) off = "&o="+offset;

    $.ajax({
        url: "ls?f="+encodeURIComponent(folder)+ off,
        success: function (json) {

          $(".load-more").parent().remove();

          if (offset === undefined) {
            if (json.folder.path != "/"){
              view.empty();
              var parent = utils.removeTrailingSlash(json.folder.path);
              //parent = utils.folder(parent);
              parent = ("/"+parent).replace(/\/\//g,"/");

              view.parent(parent,"");
            } else view.empty();
          }
          view.ls(json);

          if (json.count + json.offset < json.total){
            view.loadMore(json.folder.path,json.count+ json.offset);
          }  else view.loadHide();
        },
        error: function( json, textStatus, error ) {
          switch(json.status) {
            case 404:  alert("Unable to list folder, music folder doesn't exist. Did you setup your ROOT variable properly?"); break;
            defaut: alert("Unable to list folder, unexpected error: " + json.statusText);
          }
        }
    });
}

function updateSong(){

    var current = player.current(),
        file = current.file,
        name = file.file,
        folder =  file.folder,
        lastFolderI = folder.lastIndexOf("/");
        lastFolder = folder.substr(lastFolderI+1);

    if (settings.getBoolean("images")) images.load(folder, function(error, img){
      if (error) console.error("Error loading image on notification " + error);

      notification.add(img, lastFolder, name);
    });
    else notification.add("", lastFolder, name);

    $("#song_folder").text(folder)
                     .unbind()
                     .click(function(){ls(folder);});

    $("#song-name").text(name.replace(/_/g," ") );

    // Show name of the song on page title
    document.title = lastFolder+' - '+name;

    updateBuckets(file);
}
