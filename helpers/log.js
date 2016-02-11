var winston = require('winston');

module.exports = {

    create: function(name) {
      return new (winston.Logger)({
        transports: [
          new (winston.transports.Console)({
            level: 'info', //Change to debug to see all calls
            formatter: function(options) {
              return "["+options.level.toUpperCase() +'] ' + name + ': '+ options.message;
            }
          })
        ]
      });
    }
}
