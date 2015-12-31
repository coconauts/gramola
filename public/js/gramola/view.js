var maxFiles = 50,
    view = new View();

$( document ).ready(function() {

     $("#cover-toggle").click(function(){

         $("#cover-panel").show();
         $("#list-panel").hide();
         //TODO Smooth
     });
     $(".song-cover").click(function(){
         $("#cover-panel").toggle();
         $("#list-panel").toggle();
     });


     var squareImageHolder = function(){
       var $imageHolder = $(".image-holder");
       $imageHolder.css('height',  $imageHolder.width());
     };
     $(window).resize(function(){
        squareImageHolder();
      });
      squareImageHolder();
});

function View() {

    var listId = "#list-files";
    var moreId = "#load-more";
    var fileCounter = 0;

    this.ls = function(response, table){

      if (!table) table = listId;

      var template = $('#file-template').html();
       Mustache.parse(template);

       var $table = $(table);
       for(var i=0;i<response.files.length;i++){
           var file = response.files[i];

          add(file, template, $table);
       }

       $('.dropdown-button').dropdown({
           inDuration: 300,
           outDuration: 225,
           constrain_width: false, // Does not change width of dropdown to that of the activator
           hover: false, // Activate on hover
           gutter: 0, // Spacing from edge
           belowOrigin: false, // Displays dropdown below the button
           alignment: 'left' // Displays dropdown with edge aligned to the left of button
         }
       );
    }

    var add = function add(file, template, $table) {

      var fileResponse ;
      var icon = "";
      var type =  {
        folder: file.type == "folder" || file.type == "parent",
        song: file.type == "song"
      };
      var image = "";

      switch(file.type) {
         case "song": icon = "ion-ios-play-outline";break;
         case "folder": icon = "ion-android-folder-open"; break;
         case "parent": icon = "ion-android-folder"; break;
         case "image":
            var fullName = file.folder +"/"+ file.name + "." + file.ext;
            image = utils.serveFileUrl(encodeURIComponent(fullName));
         break;
         default: icon = "";
       }

       var data = {file:file,
         title: file.name,//utils.removeQuotes(file.name),
         type: type,
         icon: icon,
         image: image,
         id: fileCounter++
     };

      var rendered = Mustache.render(template, data);
      var $rendered = $(rendered.trim());

      //Add functionality to actions
      addActions($rendered, file);

      $table.append($rendered);
    };

    var addActions = function($rendered, file) {

      var folderDefaultAction = function(name) {
        var fullName = name.replace(/\/\//g,"/");
        $rendered.find('.default-action').click(function(){ls(fullName);});

      };
      var folderExtraActions = function(file) {

        var fullName = (file.folder +"/"+file.name).replace(/\/\//g,"/");

        $rendered.find(".play").click(function(e){addFolder(encodeURIComponent(fullName));});
        $rendered.find(".random").click(function(){collection.random(false,20,fullName);}); //collection.random(true,20,fullName);}
        $rendered.find(".infinite").click(function(){ infinite.redirect(fullName);}); //infinite.redirect(fullName, "frequency-desc")
        $rendered.find(".share").click(function(){link.prompt("?f="+fullName);});
      };

      switch(file.type) {
        case "song":

           var fullName = file.folder +"/"+ file.name + "." + file.ext;
           $rendered.find('.default-action').click(function(){player.add(file.name,fullName);});

          $rendered.find(".download").click(function(){window.open(utils.serveFileUrl(fullName),'_blank');});
          $rendered.find(".open-folder").click(function(){ls(file.path);});
          $rendered.find(".share").click(function(){link.prompt("?s="+fullName);});

        break;
        case "parent":
            folderDefaultAction(utils.folder(file.name));  //hack to go to parent folder if parent
            folderExtraActions(file);
          break;
        case "folder":
            folderDefaultAction(file.folder +"/"+file.name);
            folderExtraActions(file);
          break;
      }
    };

    this.empty = function(table){
      if (!table) table = listId;

       $(table).empty();
    };

    this.loadHide = function() {
	       $(moreId).hide();
    };
    this.loadMore = function(folder, offset ){

      $(moreId).show().unbind().click(function(){
	       ls(folder,offset);
      });
    };

    this.parent = function parent(path, table){
      if (!table) table = listId;
      var $table = $(table);

      //Fake a file with the path to reuse add function (as a folder)
      var file = {
        folder: "",
        name: path,
        type: "parent"
      };

      var template = $('#file-template').html();
      add(file, template, $table);
    };

    this.playAll = function playAll(name, table){

      var template = $('#playall-template').html();
       Mustache.parse(template);

      var rendered = Mustache.render(template, {name: name});
      var $rendered = $(rendered.trim());

      $(table).append($rendered);
      $rendered.find('.default-action').click(function(){
        player.remove();
        console.log("Loading all "+table);
        $(table).find(".play-song").click();
      });
    }
}
