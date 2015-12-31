var bunyan = require('bunyan');
var Stream = require('stream');

var parseLevel = function(level) {
    
    switch(level) {
        case 10: return "TRACE"; 
        case 20: return "DEBUG";
        case 30: return "INFO";
        case 40: return "WARN";
        case 50: return "ERROR";
        case 60: return "FATAL";
        default: return "UNDEFINED";
    }
}

var stream = new Stream();
stream.writable = true

var formatTime = function(date) {
    
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var time = date.toLocaleTimeString();
    return year+"-"+month+"-"+day+" "+time;
}
stream.write = function(obj) {

    var time = formatTime(obj.time);
    var level = parseLevel(obj.level);
    
    var l = "["+time+"] "+ level + ": "+ obj.name +": " + obj.msg;
    console.log(l)
}

module.exports = {
    
    create: function(name) {
        return bunyan.createLogger({name: name, 
            streams: [{  type: "raw", stream: stream, }],
            formatter: "pretty", 
            level: "debug"
        }); 
    }
}