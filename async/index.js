var async = require("async");
var fs = require("fs");
var path = require("path");

function dealFile(file,done){
	console.log("dealing %s...",file);
	fs.readFile(file,{
		encoding:"utf8"
	},function(err,content){
		if(err){return done(err);}
		var regexp = /sad/g;
		if(content.match(regexp)){
			content = content.replace(regexp,"happy");
			fs.writeFile(file,content,function(){
				if(err){return done(err);}
				console.log("write file %s",file);
				done(null,true);
			});
		}else{
			done(null,false);
		}
	});
}

function walkDir(dir,dealer,walkDirDone){
	function fileParsingFactory(file){
		return function(done){
			file = path.resolve(dir,file);
			fs.stat(file,dealWithStateFactory(file,done));
		};
	}

	function dealWithStateFactory(file,done){
		return function(err,stats){
			if(stats.isFile()){
				dealer(file,done);
			}else if(stats.isDirectory()){
				walkDir(file,dealer,done);
			}
		}
	}

	function isTrue(item){
		return item === true;
	}

	fs.readdir(dir, function(err,files){
		var tasks = files.map(fileParsingFactory);
		async.series(tasks,function(err,results){
			if(err){return walkDirDone(err);}
			walkDirDone(null,!!results.some(isTrue));
		});
	});
}

module.exports = function(dir,done){
	walkDir(dir,dealFile,done);
};
