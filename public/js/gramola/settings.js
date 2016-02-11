var settings = new Settings();

$( document ).ready(function() {

     $("#addUserButton").click(function(){
         user.add();
     });
     $("#settings").click(function(){
         $("#playerDiv").hide();
         $("#settingsDiv").show();
     });
     $("#backSettings").click(function(){
         $("#playerDiv").show();
         $("#settingsDiv").hide();
     });
     $("#random_save").click(function(){
        var v = $("#random_favorite").val();
        settings.set("random", v);
     });
      $('#settings-image').change(function () {
          var v = $(this).prop('checked');
          console.log("Change: image status to " + v);
          settings.set("images",v);
          $("#settings-image").prop('checked', v);
      });
      //Notification timeout
      $("#timeout-save").click(function(){
        var v = $("#timeout-setting").val();
        settings.set("timeout", v);
     });
      $("#customlist-save").click(function(){
        var v = $("#customlist-setting").val();
        settings.set("customlist", v);
     });

     settings.load();
});

function Settings(){

  //List of current keys
  //images (stringify boolean)
  //random_favorite (% chances to get favorite in random) //Server variable, you should not to use it
  //timeout (for notifications)
  var settings = {
    images: "true",
    timeout: 10,
    random_favorite: 0  ,
    customlist: ""
  };

  this.load = function(){
    $.ajax({
        url: "settings/list",
        success: function (json) {
          for (var i=0;i<json.settings.length; i++){
            var s = json.settings[i];
            settings[s.key] = s.value;
          }
          console.log(settings);

          //init different classes with value from settings
          images.init(settings.images == "true");
          notification.init(settings.timeout);

          if (settings.customlist) {
            $("#customlist-setting").val(settings.customlist);
            var customBuckets = settings.customlist.split(",");
            bucketNames = bucketNames.concat(customBuckets);
            console.log("Loaded bucketnames " + bucketNames);
            loadCustomBuckets(customBuckets);
          }
        }
    });
  };

  this.set = function(key, value){
    $.ajax("settings/set?k="+key+"&v="+value);
  };

  //@not-used Not used by now, remove this deprecation if it is requiered by any method
  this.getNoCache = function(setting, callback){
    $.ajax({
        url: "settings/get?k="+setting,
        success: function (json) {
            callback(json.value);
        }
    });
  };

  this.get = function(key){
    var value = settings[key];
    if (typeof value == 'undefined') console.error("Setting key "+ key + " is undefined");
    return value ;
  };
  this.getBoolean = function(key){
    return this.get(key) == "true";
  };

}
