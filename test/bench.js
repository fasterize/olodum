var exec = require('child_process').exec


for (var i=0 ; i < MAX ; i++) {
    exec('host ' + domains[j] + ' ' + NSSERVER, function (err,stdout) {
	//nothing	
	});
}
