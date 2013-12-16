var Q = require("q");
var fs = require("fs");
var path = require("path");

function readFile(file){
	return Q.nfcall(fs.readFile, file, {encoding:"utf-8"});
}

function writeFile(file,content){
	return Q.nfcall(fs.writeFile, file, content, {encoding:"utf-8"});
}

function stat(file){
	return Q.nfcall(fs.stat,file);
}

function readDir(dir){
	return Q.nfcall(fs.readdir, dir);
}

function dealFile(file){
	console.log("dealing %s...",file);
	var deferred = Q.defer();
	readFile(file)
	.then(function(content){
		var regexp = /sad/g;
		if(content.match(regexp)){
			content = content.replace(regexp,"happy");
			console.log("write file %s",file);
			writeFile(file,content)
			.then(function(){
				deferred.resolve(true);
			}).fail(deferred.reject);
		}else{
			deferred.resolve(false);
		}
	}).fail(deferred.reject);;
	return deferred.promise;
}

function dealFileOrDir(filePath){
	var deferred = Q.defer();
	stat(filePath).then(function(stats){
		var dealer = null;
		if(stats.isFile()){
			dealer = dealFile;
		}else if(stats.isDirectory()){
			dealer = dealDir;
		}
		dealer(filePath).then(deferred.resolve).fail(deferred.reject);
	}).fail(deferred.reject);
	return deferred.promise;
}

function isTrue(item){
	return item === true;
}

function dealDir(dir){
	var deferred = Q.defer();
	readDir(dir).then(function(files){
		var resolve = function(file){return path.resolve(dir,file);}
		fileDealPromises = files.map(resolve).map(dealFileOrDir);

		Q.all(fileDealPromises)
		.then(function(results){
			deferred.resolve(!!results.some(isTrue));
		})
		.fail(deferred.reject);
	}).fail(deferred.reject);

	return deferred.promise;
}

module.exports = function(dir,done){
	dealDir(dir)
	.then(function(result){
		if(result){
			console.log("no sad now");
		}else{
			console.log("already no sad");
		}
		done()
	}).fail(done);
}