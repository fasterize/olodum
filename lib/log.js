var growl = require('growl');

exports.logMsg = function (msg, isDev) {
  var d = new Date();
  d = d.toDateString() + ' ' + d.toLocaleTimeString();
  if (isDev === undefined) isDev = true ;
	if (isDev) {
		growl(msg, { title: 'Fasterize Local DNS Server', image: './olodum.png'})
		if (typeof msg ==='string') {
			console.log(d+ '\t' + msg);
		}
		else {
			console.log(d);
			console.log(msg)
		}
	}
	else {
		console.log(d + '\t' + msg)
	}
};


