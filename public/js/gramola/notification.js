var notification = new Notifications();

function Notifications(){

  var timeout = 5000;
  
  //Set timeout with value from settings
  this.init = function(t){
    if (t) timeout = parseInt(t); //else keep default value
    $("#timeout-setting").val(timeout);
  }
    
  this.add = function(img, title, msg ){
    
    if (!img) img ='favicon.ico';
    genericNotification(img,title,msg);
  } 
  
  var genericNotification = function(img,title,msg){
    //https://developer.mozilla.org/en-US/docs/Web/API/notification
    var options = {
      body: msg,
      icon:img
    }   
    var notification = new Notification(title, options)
    setTimeout(function(){ notification.close() }, timeout);
    //TODO we could use Notification.onclick to skip songs
  }
}


