var exec = require("child_process").exec;
var async = require("async");
var path = require("path");

function dealRootFactory(rootPath,module){
	return function(done){
		var command = "\nrm -rf result && cp -r " + rootPath + " result";
		console.log(command);
		exec(command,function(err,stdout){
			if(err){return done(err);}
			var mod = require("./" + module);
			console.log("%s processing",module);
			mod( path.resolve("./result") ,done);
		});
	}
}

var tasks = ["async","promise"].map(function(module){
	return dealRootFactory("source",module)
});

var tasks_already_happy = ["async","promise"].map(function(module){
	return dealRootFactory("source_no_sad",module);
});



async.series(tasks.concat(tasks_already_happy));