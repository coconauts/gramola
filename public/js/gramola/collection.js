var collection = new Collection();

$( document ).ready(function() {
    $('#search-text').keyup(function (e) {
        if (e.which == 13) collection.search();
    });
});

function Collection(){

  this.search = function(){
    var text = $('#search-text').val();

    if (text.length){
      $.ajax({
          url: "collection/search?s="+text,
          dataType: "json",
          success: function (json) {
            view.empty();

            view.playAll("search", "#list-files");
            view.ls(json);
          }
      });
    } else ls('/');//length == 0
  }

 this.random = function(dir,n,f, sort){

    var folder = (dir)?"&folder":"";
    $.ajax({
      url: "collection/random?n="+n+"&f="+f+folder +"&s="+sort,
      cache: false,
      success: function (json) {
          if (dir){
              if (json.files.length==0) return;
              var folder = json.files[0].folder;
              addFolder(folder);
          } else addSongFromFiles(json);
      }
    });
  }
}
