var woal = new Woal();

$( document ).ready(function() {
    //myIp = myIP();
    $("#woal-tab").click(function(){
      woal.list();
    })
});

function Woal(){
  
  this.list = function list(){
    $.ajax({
        url: "woal/list",
        dataType: "json",
        success: function (json) {
          view.empty("#list-woal");
          view.ls(json, "#list-woal");
        }
    });  
  }
}

