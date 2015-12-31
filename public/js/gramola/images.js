var images = new Image();
var carousel = new Carousel();

function Carousel(){
  var images = [],
      timeout = 5000,
      current = 0,
      loop;

  this.loading = function(){
    console.log("Loading image");
    $('.song-cover').removeClass("icon-noimage").removeAttr("src").addClass("icon-reload-loading");
    clearInterval(loop);
  }

  this.controls = function(){
    var $div = $(".cover-controls");

    $div.find('.count').html(current+1);
    $div.find('.total').html(images.length);

    var  that = this;

    $div.find('.left-control').unbind().click(function(){
      clearInterval(loop);
      loop = setInterval(function(){that.next()},5000);
      that.previous()
    });
    $div.find('.right-control').unbind().click(function(){
      clearInterval(loop);
      loop = setInterval(function(){that.next()},5000);
      that.next()
    });

    if(images.length > 0) {
      $div.show();
      //$div.html($left).append(counter).append($right);
    } else {
      $div.hide();
      //$div.empty();
    }

  }
  this.load = function(urls){

    //Remove loading status
    $('.song-cover').removeClass("icon-reload-loading");

    images = urls;
    current = -1;
    this.controls();

    if (urls.length > 0 ){

      this.next();
      var that = this;

       //Autoload next image on interval (if visible)
      loop = setInterval(function(){
          if (!utils.isPageHidden())  that.next();
          else console.log("Page is hidden, not loading next image");
        },5000);

    } else {
      $('.song-cover').addClass("icon-noimage");
    }
  }

  this.previous = function(){

    if (current > 0) current--;
    else current = images.length-1; //restart

    var url = images[current];
    $('.song-cover').attr("src",url );

    this.controls();
  }
  this.next = function(){

    if (current < images.length-1) current++;
    else current = 0; //restart

    var url = images[current];
    $('.song-cover').attr("src",url );

    this.controls();

  }
}

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
