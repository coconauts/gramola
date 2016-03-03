var winston = require('winston');

module.exports = {

    create: function(name) {
      var level = "info";
      if (config.DEBUG) level = "debug";
      return new (winston.Logger)({
        transports: [
          new (winston.transports.Console)({
            level: level, //Change to debug to see all calls
            formatter: function(options) {
              return "["+options.level.toUpperCase() +'] ' + name + ': '+ options.message;
            }
          })
        ]
      });
    }
}
