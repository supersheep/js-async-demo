var exec = require("child_process").exec;
var async = require("async");
var path = require("path");

var tasks = ["async","promise"].map(function(module){
	return function(done){
		var command = "\nrm -rf result && cp -r source result";
		console.log(command);
		exec(command,function(err,stdout){
			if(err){return done(err);}
			var mod = require("./" + module);
			console.log("%s processing",module);
			mod( path.resolve("./result") ,done);
		});
	}
});

async.series(tasks,function(err,results){
	if(err){throw err;}
	console.log(results);
});