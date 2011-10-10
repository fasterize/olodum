/*var exec = require('child_process').exec


for (var i=0 ; i < MAX ; i++) {
    exec('host ' + domains[j] + ' ' + NSSERVER, function (err,stdout) {
	//nothing	
	});
}
*/
var dns = require('dns');
var MAX = 1000 || argv[0];
var startTime = new Date().getTime();
var count = 1;
for (var i = 0; i < MAX; i++) {
	(function () {
		var my_i = i;
		var my_name = 'toto' + i + '.fasterized.com';
		// my_name = 'www.google.com';
		dns.resolve(my_name, function (err,addr) {
			if (err) throw err;
			// console.log('toto' + my_i + '.fasterized.com : ' + JSON.stringify(addr));
			count++;
			if (count === MAX) {
				endTime = new Date().getTime();
				console.log ('end : ' + (endTime - startTime));
			}
		});
	}
	)();
};

