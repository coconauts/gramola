var buckets = {};
var bucketNames = ["favorite", "blacklist"];

$( document ).ready(function() {

    $("#bucket-dropdown").click(function(){
      //TODO Show only 'on show'
      //otherFavorites.loadShow();
    });
    $("#buckets-tab").click(function(){
      //favorite.show();
      listBucket('favorite');
      //loadSelect()
      //TODO Load other categories from other users
    });

    loadBucket("favorite");
    loadBucket("blacklist");
});

var listBucket = function(category){

  var response = buckets[category];

    var tableId = "#list-bucket";

    view.empty(tableId);
    view.playAll(category, tableId);
    view.ls(response, tableId);
}

var loadBucket = function(category){
  $.ajax({
      url: "bucket/list?c="+category,
      success: function (json) {
          console.log("Loading bucket " + category + " with " + json.length + " files");
          buckets[category] = json;
      }
  });
}

var toggleBucket = function(category, file, callback){
  console.log("Toggling  "+ category , file);
  $.ajax({
    url: "bucket/toggle?f="+encodeURIComponent(file.folder)+"&n="+encodeURIComponent(file.file)+"&e="+file.ext+"&c="+category,
    success: function (json) {
      callback();
    }
  });
}

var bucketContains = function(category, file) {

  var categoryFiles = buckets[category];
  if (!categoryFiles)  {
    console.error("Empty category bucket " + category);
    return false;
  }
  var files = categoryFiles.files;

  for(var i = 0; i < files.length; i++) {
      var f = files[i];

      var filename = file.file || file.name;
      if(f.folder == file.folder && f.name == filename) return true;
  }
  return false;
};


function updateBuckets(file){

  var bucketOn = 'bucket-on';
  var bucketOff = 'bucket-off';

  var $bucketContainer = $("#song_info_actions");

  $bucketContainer.find(".bucket-toggle").each(function(){
      var $this = $(this);
      var category = $this.attr('category');
      var contains = bucketContains(category, file);
      if (contains) $this.removeClass(bucketOff).addClass(bucketOn);
      else $this.removeClass(bucketOn).addClass(bucketOff);

      $this.unbind().click(function(){
        var $this =   $(this);
        var category = $this.attr('category');
        toggleBucket(category,file, function(){
           if( $this.hasClass(bucketOn) )  $this.removeClass(bucketOn).addClass(bucketOff);
           else $this.removeClass(bucketOff).addClass(bucketOn);
        });
      });
  });
}

//Loaded after settings
var loadCustomBuckets = function(customBuckets){

  console.log("Loading custom buckets " , customBuckets);
  for(var i = 0; i < customBuckets.length; i++)  loadBucket(customBuckets[i]);

  var template = $('#custom-buckets-template').html();
  Mustache.parse(template);
  var rendered = Mustache.render(template, customBuckets);
  $("#custom-buckets").html(rendered);

  $(".dropdown-button").dropdown();
}
