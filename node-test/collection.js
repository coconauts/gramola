var should = require('should'), //http://unitjs.com/guide/should-js.html
    sqlite3= require("sqlite3"),
    dbUtils= require("../models/db.js"),
    utils= require("../helpers/utils.js"),
    now = new Date().getTime(),
    dbName = "/tmp/"+now+".db",
   collection= require("../models/collection.js"),
   test = require('./test.js');

global.db = new sqlite3.Database(dbName);

console.log("Running Collections tests");


var testStart = function() {
    var files = 
      [ { ext: 'png', folder: '', name: 'root-image', type: 'image' },
	{ ext: 'mp3', folder: '', name: 'root-song', type: 'song'},
	  
	{ ext: 'png', folder: 'folder', name: 'image', type: 'image' },
	{ ext: 'mp3', folder: 'folder', name: 'song', type: 'song'},
	{ ext: 'jpg', folder: 'folder', name: 'image', type: 'image' },

	{ ext: 'mp3', folder: 'folder 2/cd 1', name: 'song', type: 'song'},
	{ ext: 'png', folder: 'folder 2/covers', name: 'image', type: 'image' },
	{ ext: 'jpg', folder: 'folder 2/covers', name: 'image', type: 'image' },
	
	{ ext: 'png', folder: 'music', name: 'image', type: 'image' },
	{ ext: 'mp3', folder: 'music', name: 'song1', type: 'song'},
	{ ext: 'jpg', folder: 'music', name: 'image', type: 'image' },
	{ ext: 'mp3', folder: 'music', name: 'song2', type: 'song'}
	  
      ];
      console.log("Inserting " + files.length + " files in collection");

      collection.insertMultiple(files, function(){syncTest()});
}

var syncTest = function(){

    db.get("SELECT count(*) as count FROM collection",[], function(err, result){
      
      test.test('Collection#Count', function(){
	(result.count).should.equal(12);
      });
    });
  
    collection.imageSearch( "music", 5, function(images){
      test.test('Collection#imageSearch - music', function(){
	if (images.length != 2 ) console.log(images);
	images[0].folder.should.be.equal("music");
      });
    });
  
  
    collection.imageSearch( "folder 2/cd 1", 5, function(images){
      test.test('Collection#imageSearch - cd', function(){
	if (images.length != 2 ) console.log(images);
	images[0].folder.should.be.equal("folder 2/covers");
      });
    });
  
    collection.imageSearch( "folder", 5, function(images){
      test.test('Collection#imageSearch - multiple folder (unexpected side effect)', function(){
	if (images.length != 4 ) console.log(images);
			    
	images[0].folder.should.be.equal("folder");
	images[1].folder.should.be.equal("folder");
	images[2].folder.should.be.equal("folder 2/covers");
	images[3].folder.should.be.equal("folder 2/covers");
      });
    });
  
  
    collection.imageSearch( "", 5, function(images){
      test.test('Collection#imageSearch - limit number of images', function(){
	//console.log(images);
	if (images.length != 5 ) console.log(images);
	
	images[0].folder.should.be.equal("");
      });
    });
  
   
    collection.random( 1,"song", "music", undefined, function(err,json){
      test.test('Collection#random - random music folder', function(){
            json.length.should.be.equal(1);
            json[0].folder.should.be.equal("music");
      });
    });
   test.test('Collection#random - multiple random test', function(){
     
     var N_IMAGES = 10;
     var N_SONGS = 10;
     var N_TESTS = 1000;
     
     var randomSyncTest = function(){
        console.log('Finished inserting, testing random songs');
	var random = [];
	var processed = 0;
	for (var i=0 ; i < N_TESTS; i++){
	    collection.random( 1,"song", "random", undefined,  function(err,json){
	      if (err) console.log(err);
	      random.push(json[0].name);
	      if (random.length == N_TESTS){
		console.log("Total songs " + random.length);
		//console.log(random);
		//TODO do the sort / uniq here
		console.log("use `./run.sh | grep 'song' | sort | uniq -c` to count the randoms");
	      }
	    });
	}
     }
     
     //Generate N_IMAGES + N_SONGS new records in database
     var files = [];
     //Generate N_IMAGES new images
      for (var i=0 ; i < N_IMAGES; i++){
       files.push({ ext: 'png', folder: 'random', name: 'image'+i, type: 'image' });
     }
     //Generate N_SONGS new songs
     for (var i=0 ; i < N_SONGS; i++){
	files.push({ ext: 'mp3', folder: 'random', name: 'song'+i, type: 'song' });
     }
     console.log('Inserting ' + files.length + ' files ');
     collection.insertMultiple(files, function(){randomSyncTest()});
     
  });
}

dbUtils.init(testStart);

console.log();
