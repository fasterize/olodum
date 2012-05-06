var growl = require('growl');

exports.logMsg = function (msg, isDev) {
  if (isDev === undefined) isDev = true ;
	if (isDev) {
		growl(msg, { title: 'Fasterize Local DNS Server', image: './olodum.png'})
		if (typeof msg ==='string') {
			console.log(Date()+ '\t' + msg);
		}
		else {
			console.log(Date());
			console.log(msg)
		}
	}
	else {
		console.log(Date() + '\t' + msg)
	}
};


