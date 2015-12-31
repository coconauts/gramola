var user = new User();

$( document ).ready(function() {

    setInterval(function(){user.request()},10*60*1000);
    user.check();

    $('#userLogin').keyup(function (e) {
        if (e.which == 13) user.login();
    });
    $('#passLogin').keyup(function (e) {
        if (e.which == 13) user.login();
    });

    //elements to show if user is logged in
    if (user.isLogged()){


        //hide/show login menu in loginRequest()
        ls("/");
        //blacklist.update();
      //  favorite.update();
    }
});

function User(){

  var user;

  this.isLogged = function logged(){
    if (user == undefined) this.request(); //request it the first time we need it
    return this.user.logged;
  }

  this.login = function login(user,passSHA1){
    if (!user) user= $("#userLogin").val(); //if no parameter, take it from input
    if (!passSHA1) passSHA1= utils.SHA1($("#passLogin").val());

    var values = {user:user, pass:passSHA1};
    $.ajax({
        url: "user/login",
        dataType: "json",
        async: false,
        type: "post",
        data: values,
        success: function (json) {
            if (json.error){
                $("#passLogin").css("background-color","red");
                $("#passLogin").val("");
                setTimeout(function(){$("#passLogin").css("background-color","");},1000);
                console.log(json.errorMsg);
            } else {
                user = json;
                window.location.reload();
            }
        }
    });
  }

  this.list = function list(callback){
    $.ajax({
        url: "user/list",
        success: function(json){
          callback(json);
        }
    });
  }
  //Synchronous ajax request
  this.request = function request() {
    var json = $.ajax({
        url: "user/is_logged",
        dataType: "json",
        async: false
    }).responseText;

    json = JSON.parse(json);
    if (json.logged) { // logged
      $(".logged").show();
      $(".notLogged").hide();
      $('.login-required').show();

      if (json.admin) $(".admin-required").show();
    } else if (this.user && this.user.logged) { //not logged anymore
      console.log("Session ended, login status: "+this.user.logged +", current status: "+ json.logged);
      //window.location.reload();
    } else { // not logged
      //$("#userLogged").html("Logged as "+json.user);
      $(".logged").hide();
      $(".notLogged").show();
      $('.login-required').hide();
    }

    this.user = json;
  };

  this.logout =  function logout(){
      $.ajax({
          url: "user/logout",
          dataType: "json",
          async: false
      });
      window.location.reload();
  };

  this.check = function check(){
      $.ajax({
          url: "user/count",
          dataType: "json",
          success: function (json) {
              if (!json.count){ //count != 0
                console.log("No users found, redirecting to setup");
                window.location.replace(location.pathname+"setup");
              }
          }
      });
  };



}
