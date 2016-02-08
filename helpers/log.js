var winston = require('winston');
require('winston-papertrail').Papertrail;

var formatTime = function(date) {

    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var time = date.toLocaleTimeString();
    return year+"-"+month+"-"+day+" "+time;
}
var format = function(level, message) {

    var time = formatTime(new Date());
    var level = level.toUpperCase();

    return "["+time+"] "+ level + ": "+ message;
}

var loadPapertrail = function(){
  if (!config || !config.LOG_HOST || !config.LOG_PORT) {
    console.error("You must provide a host and port for papertrail loging");
    return;
  }

  //console.log("Loading papertrail host ", host, " port ", port);
  return new winston.transports.Papertrail({
      host: config.LOG_HOST,
      port: config.LOG_PORT,
      program: "gramola",
      logFormat: function(level, message) {
          var formatted = format(level,message);
          console.log(formatted);
          return formatted;
      }
  });
}
module.exports = {

    create: function(name) {

        var logger = new winston.Logger({
          transports: [
             loadPapertrail()
          ]
        });
        return logger;
    }
}
