var utils = new Utils();

function Utils(){

  this.SHA1 = function(d){
    function l(a,b){return a<<b|a>>>32-b}function n(a){var b="",d,c;for(d=7;0<=d;d--)c=a>>>4*d&15,b+=c.toString(16);return b}var a,c,g=Array(80),p=1732584193,q=4023233417,r=2562383102,s=271733878,t=3285377520,b,e,f,h,k;d=function(a){a=a.replace(/\r\n/g,"\n");for(var b="",d=0;d<a.length;d++){var c=a.charCodeAt(d);128>c?b+=String.fromCharCode(c):(127<c&&2048>c?b+=String.fromCharCode(c>>6|192):(b+=String.fromCharCode(c>>12|224),b+=String.fromCharCode(c>>6&63|128)),b+=String.fromCharCode(c&
    63|128))}return b}(d);b=d.length;var m=[];for(a=0;a<b-3;a+=4)c=d.charCodeAt(a)<<24|d.charCodeAt(a+1)<<16|d.charCodeAt(a+2)<<8|d.charCodeAt(a+3),m.push(c);switch(b%4){case 0:a=2147483648;break;case 1:a=d.charCodeAt(b-1)<<24|8388608;break;case 2:a=d.charCodeAt(b-2)<<24|d.charCodeAt(b-1)<<16|32768;break;case 3:a=d.charCodeAt(b-3)<<24|d.charCodeAt(b-2)<<16|d.charCodeAt(b-1)<<8|128}for(m.push(a);14!=m.length%16;)m.push(0);m.push(b>>>29);m.push(b<<3&4294967295);for(d=0;d<m.length;d+=16){for(a=0;16>a;a++)g[a]=
    m[d+a];for(a=16;79>=a;a++)g[a]=l(g[a-3]^g[a-8]^g[a-14]^g[a-16],1);c=p;b=q;e=r;f=s;h=t;for(a=0;19>=a;a++)k=l(c,5)+(b&e|~b&f)+h+g[a]+1518500249&4294967295,h=f,f=e,e=l(b,30),b=c,c=k;for(a=20;39>=a;a++)k=l(c,5)+(b^e^f)+h+g[a]+1859775393&4294967295,h=f,f=e,e=l(b,30),b=c,c=k;for(a=40;59>=a;a++)k=l(c,5)+(b&e|b&f|e&f)+h+g[a]+2400959708&4294967295,h=f,f=e,e=l(b,30),b=c,c=k;for(a=60;79>=a;a++)k=l(c,5)+(b^e^f)+h+g[a]+3395469782&4294967295,h=f,f=e,e=l(b,30),b=c,c=k;p=p+c&4294967295;q=q+b&4294967295;r=r+e&4294967295;
    s=s+f&4294967295;t=t+h&4294967295}k=n(p)+n(q)+n(r)+n(s)+n(t);return k.toLowerCase()
  }

  this.loadParams = function(url){
    if (url) url =url.replace('?','');
    else url = window.location.search.substr(1);
    var prmarr = url.split("&");

    var params = {};

    for ( var i = 0; i < prmarr.length; i++) {
	var tmparr = prmarr[i].split("=");
	params[tmparr[0]] = tmparr[1];
    }
    return params;
  }

  this.removeQuotes = function(text){
    return text.replace(/'/g,"&#39;");
  }

  this.removeTrailingSlash = function(str){
    return removeLastChar(str,"/");
  }
  this.file = function(f){
    f = this.removeServeFile(f);
    return {
      path: f,
      folder: this.folder(f),
      file: this.filename(f),
      ext: this.ext(f)
    };
  }

  this.removeServeFile = function(path){
    return path.replace(/.*serve\?f=/g, "")
  }

  this.serveFileUrl = function(path){
      var baseUrl = "serve?f=",
          pathUrl = encodeURIComponent(path);
          fullUrl = baseUrl+pathUrl;

      return fullUrl.replace(/\/\//g,"\'");
  }
  this.ext = function(file) {
      var extensionIndex = file.lastIndexOf(".") ;
      return file.substr(extensionIndex+1);
  }
  this.folder = function(file) {
      var folderIndex = file.lastIndexOf("/") ;
      return file.substr(0,folderIndex);
  }
  this.filename = function(file) {
      var fileI = file.lastIndexOf("/"),
          extI = file.lastIndexOf(".");
      if (extI < 0) return file.substr(fileI);
      else return file.substr(fileI+1,extI-fileI-1); //remove extension
  }

  var removeLastChar = function(str, c) {
      var newstr = str;
      var lastChar= str.charAt(str.length-1);
      if (lastChar == c){
          newstr = str.substring(0,str.length-1);
      }
      return newstr;
  }
  this.isPageHidden = function(){
     return document.hidden || document.msHidden || document.webkitHidden || document.mozHidden;
  }
}
