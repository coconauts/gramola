var carousel = new Carousel();

function Carousel(){
  var images = [],
      timeout = 5000,
      current = 0,
      loop;

  this.loading = function(){
    console.log("Loading images");
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

    $('.song-cover').remove();

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

    var oldId = current;
    if (current > 0) current--;
    else current = images.length-1; //restart

    this.loadImage(oldId, current);

    this.controls();
  }
  this.next = function(){

    var oldId = current;
    if (current < images.length-1) current++;
    else current = 0; //restart

    this.loadImage(oldId, current);

    this.controls();

  }

  this.loadImage = function(oldId, id) {
    console.log("Loading new image "+oldId+ " -> " + id );
    if (oldId >= 0) $(".song-cover-"+oldId).hide();

    if ($(".song-cover-"+id).length) {
      //Song cover exists, show them (do not reload)
      $(".song-cover-"+id).show();
    } else {
      //Song id doesn't exist, create it
      var url = images[current];
      var img ="<img class='song-cover song-cover-"+id+" responsive-img' src='"+url+"' />";
      var cover = $(img);
      $(".image-holder").append(cover);
    }
  }
}
