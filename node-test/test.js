var should = require('should');

var test = function(name, fn){
    try {
      fn();
    } catch (err) {
      console.log('    \x1b[31m%s', name);
      console.log('    %s\x1b[0m', err.stack);
      return;
    }
    console.log('  √ \x1b[32m%s\x1b[0m', name);
}
var countRows = function(table, c){

    db.all("SELECT *  FROM "+table,[], function(err, result){
        test("Counting "+table+ " results: "+c, function(){
            
            //if (result.length != c) console.log(result);
            (result.length).should.equal(c);
        });
    });
}

var sample = function(table, sample){

    if (!sample) sample = 10;
    
    db.all("SELECT *  FROM "+table + " ORDER BY id desc limit ? ",[sample], function(err, result){
        if (err) console.log(err);
        for(var i = 0; i < result.length; i++){
            console.log(table +" " + i + ": " , result[i]);
        }
    });
}
module.exports = {
  
  test: test,
  countRows: countRows,
  sample: sample
}