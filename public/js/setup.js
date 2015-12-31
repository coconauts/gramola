$( document ).ready(function() {
    $("#submit").click(function(){

      var name = $("#admin-name").val();
      var pass = $("#admin-pass").val();
      var music = $("#music-path").val();

      if (!name) error("Must specify a name");
      else if (!pass) error("Must specify a password");
      else if (!music) error("Must specify a music folder");
      else {

        $.ajax({
          url: 'setup',
          method:'POST',
          data: {
            name:name,
            pass: utils.SHA1(pass),
            music:music
          },
          success: function(json){
            console.log(json);

            if (json.error) error(json.error);
            else window.location.reload();
          }
        });
      }
    });
});

var error = function(error){
  $("#error").show();
  $("#error-message").html(error);
  console.error(error);
};
