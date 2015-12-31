//The first element is the disabled element
var infinite = new Infinite(); //initialized in view.js (first call)

$( document ).ready(function() {
  
  infinite.disable();
  $("#infinite_disabled").click(function(){
    player.remove();
    infinite.disable();
  });
  $("#infinite_all").click(function(){
    player.remove();
    infinite.set("/");
  });
  $("#infinite_current").click(function(){
    infinite.set(player.current().file.folder);
  });
    
});
    

function Infinite(){
  
  //TODO: save custom list in database, generate it dynamically
  var selected = "Disabled", //"Disabled", "All", "Current"
      maxPlaylistSize = 15,
      loop,
      sort;
      
  this.disable = function disable(){
     selected = "Disabled";
     $('#infinite_id').attr("title",'Disabled').removeClass().addClass("icon-shuffle-disabled");
     $("#infinite_label").html("Disabled" );
     clearInterval(loop);
  }
  
  this.redirect = function (mode, sort){
    var sortArg = "";
    if (sort) sortArg = "&sort="+sort;
    window.location.replace(location.pathname+"?i="+mode + sortArg);
  }
  
  this.set = function (mode, s){
        
    selected = mode;
    sort = s;
    
    $('#infinite_id').attr("title",'Shuffle: '+mode).removeClass().addClass("icon-shuffle");
    $("#infinite_label").html(mode.substring(0,8) );
    
    this.load(maxPlaylistSize);
    var that = this;
    loop = setInterval(function(){that.load(1)},5000);
  }

  this.load = function load(n){

    if (player.pos() > 5 ) player.remove(0);
    if (player.size() < maxPlaylistSize){
      collection.random(false,n,selected, sort);
    }
  }
}