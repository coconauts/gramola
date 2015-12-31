$( document ).ready(function() {
    
  $("#stats-tab").click(function(){
    console.log("Loading stats");
    loadTotalSongs();
    loadStats("popular", "Popular");
    loadStats("never-played", "Never played");
    loadStats("new", "New");

  });
}); 


var loadTotalSongs = function(type){
  
  $.ajax({
    url: "stats/total",
    success: function(json){
      $("#total-songs").html(json.total+ " songs");
    }
  });
}
var loadStats = function(type, title){
  
  $.ajax({
    url: "stats/"+type,
    success: function(json){
      $table = $("#"+type);
      $table.html("<tr><th></th><th>"+title+"</th><th></th></tr>");
      for(var i=0; i< json.songs.length; i++){
	var s = json.songs[i];
	var fullName = s.folder+'/'+s.name+"."+s.ext;
	var count = "";
	if (s.count) count = "<td>"+s.count+"</td>";
	var rowTemplate = 
	"<tr title='"+fullName+"'>"+
	  "<td >"+(i+1)+"</td>"+
	  "<td >"+s.name+"</td>"+
	  count+
	"</tr>";
	var $row = $(rowTemplate);
	var addClick = function(o, title, name) {
	  o.click(function(){
	    player.add(title, name);
	  });
	};
	addClick($row,s.name, fullName);
	$table.append($row);
      }
    }
  });
}