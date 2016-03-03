var images = new Image();

function Image() {

  var lastFolder = "",
      firstCover = "";

  //Set enabled with value from settings
  this.init = function(enabled){
    $("#settings-image").prop('checked', enabled); //else keep default value
  };

  this.load = function(folder, callback){

      //do not reload images if they are from the same folder
      if (lastFolder == folder)  callback(firstCover); //Still send notification in the callback
      else {
        carousel.loading();

        $.ajax({
          url: "collection/images?f="+folder,
          dataType: "json",
          success: function (json) {

              lastFolder = folder;
              firstCover = "";

              var urls = [];
              var loadUrls = function(error, urls){

                  var firstcover = urls[0];
                  carousel.load(urls);
                  callback(error, firstcover);
              };

              if (json.files.length === 0) downloadCover(folder, loadUrls );
              else parsingCovers(json.files, loadUrls);
          }
        });
      }
  };

  var parsingCovers = function(files, callback){

    var urls = [];
    for (var i=0 ; i < files.length; i++){
      var file = files[i];
      var  path = file.folder+"/"+file.name+"."+file.ext;
      var  url = utils.serveFileUrl(path) ;
      urls.push(url);
    }
    callback(undefined, urls);

    $("#download-image").hide();
  };

  var downloadCover = function(folder, callback ) {

    var searchName = folder.replace(/\//g," ");
    $.ajax({
      url: "images/search?n="+searchName,
      success: function(json){
          if(json.error) console.error("Unable to download cover ", json.error);
          callback(json.error, [json.url]);

          $("#download-image").show();
          $("#download-image").unbind().click(function(){
            $.ajax({
              url: "images/download?f="+folder+"&u="+encodeURIComponent(json.url),
              success: function(json){
                $("#download-image").hide();
              }
            });
          });

        }
      });
  };
}
