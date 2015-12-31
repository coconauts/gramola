var should = require('should'),
    utils = require('../helpers/utils.js'),
   test = require('./test.js');
    
console.log("Running Utils tests");

test.test('Utils#removeExtension', function(){
  utils.removeExtension("file.png").should.equal("file");
  utils.removeExtension("file").should.equal("file");
  utils.removeExtension("file.dot.png").should.equal("file.dot");
  utils.removeExtension("file.sh").should.equal("file");
});

test.test('Utils#getFolder', function(){
  utils.getFolder("file.png").should.equal("");
  utils.getFolder("folder/file.png").should.equal("folder");
  utils.getFolder("folder/subfolder/file.png").should.equal("folder/subfolder");
  utils.getFolder("/root/folder/file.png").should.equal("/root/folder");
});

test.test('Utils#removeFolder', function(){
  utils.removeFolder("file.png").should.equal("file.png");
  utils.removeFolder("folder/file.png").should.equal("file.png");
  utils.removeFolder("folder/subfolder/file.png").should.equal("file.png");
  utils.removeFolder("/root/folder/file.png").should.equal("file.png");
});

test.test('Utils#removeDiscs', function(){
  utils.removeDiscs("/root/folder/CD1/file.png").should.equal("/root/folder");
  utils.removeDiscs("/root/folder/cd 1/file.png").should.equal("/root/folder");
  utils.removeDiscs("/root/folder/disk 1/file.png").should.equal("/root/folder");  
});


test.test('Utils#parseFile', function(){

  var root=__dirname+"/";
  var testParse = function(result, expected){
    result.should.have.property('folder',expected.folder);
    result.should.have.property('name',expected.name);
    result.should.have.property('ext',expected.ext);
    result.should.have.property('type',expected.type);
  }
  
  testParse(utils.parseFile(root, "files", "folder"), { ext: '', folder: 'files', name: 'folder', type: 'folder' ,desc: undefined}) ;
  testParse(utils.parseFile(root, "files/folder", "coconauts.png"), { ext: 'png', folder: 'files/folder', name: 'coconauts', type: 'image', desc: undefined }) ;
  testParse(utils.parseFile(root, "files", "empty.txt"), { ext: 'txt', folder: 'files', name: 'empty', type: 'file', desc: undefined }) ;
  testParse(utils.parseFile(root, "files", "song.mp3"), { ext: 'mp3', folder: 'files', name: 'song', type: 'song', desc: undefined }) ;

});

test.test('Utils#sortFiles', function(){

  var f = function(type, name){
    return {type: type, name: name};
  }
  var files = [f('song','c'),f('folder','a'), f('folder','b'), f('image','a'),f('file','a'),f('song','b'),f('song','a'),f('folder','c')];
  var expected = [f('folder','a'), f('folder','b'),f('folder','c'),f('song','a'),f('song','b'),f('song','c'), f('image','a'),f('file','a')];

  files.sort(utils.sortFiles);
  
  var equal = function(list1, list2){
      for(var i=0; i < list1.length; i++){
	var l1 = list1[i];
	var l2 = list2[i];
	
	l1.type.should.equal(l2.type);
	l1.name.should.equal(l2.name);
      }
  }
  
  equal(files,expected);
});

console.log();