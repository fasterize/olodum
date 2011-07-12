/* TODO : 
refactor ipv4/ipv6
separate local/dev environnement
isolate resolver
process.env.NODE_DEV only accessible in sudo if added to the user env variable then exported :
$ NODE_ENV=dev
$ export NODE_ENV
$ sudo visudo
=> add this line
Defaults        env_keep += "NODE_ENV"
*/
var ndns = require('./lib/ndns');
var dnsServer = ndns.createServer('udp4');

var BIND_PORT = 53;
var TTL = 5;

// Temp : IP in the code, not in a global conf
var ipv4s = [];
if (process.env.NODE_ENV != 'dev') {
	TTL=300;
	ipv4s.push('31.222.176.200');
	//ipv4s.push('31.222.176.201');
}
else {
	ipv4s.push('127.0.0.1');
}
var ipv6s = [];
//ipv6s.push('2002:0:0:0:0:0:1fde:b0c8');

dnsServer.on("request", function(req, res) {
	// duplicate query headers in response
    res.setHeader(req.header);

	//
    for (var i = 0; i < req.q.length; i++) {
		//parse query and add it to the response object
		res.addQuestion(req.q[i]);

		//set some response headers
		res.header.aa = 1;         // authoritative answer
		res.header.ra = 0;
		res.header.qr = 1;			// Message type = response
		res.header.rd = 0;
		res.header.arcount = 0;		// number of Additional Records
	
		// domain name queried
		var name = (req.q[0].name === '.' ? '' : req.q[0].name);

		// only respond to query ending with fasterized.com
		if (name.match('fasterized\.com')) {
			// This server only respond to A or AAAA query
			if (req.q[i].type == ndns.ns_type.ns_t_a || (req.q[i].type == ndns.ns_type.ns_t_aaaa && ipv6s.length > 0) ) {

				//add all records in ips array to response 
				if (req.q[i].type == ndns.ns_type.ns_t_a) {
					res.header.nscount = 1;		// number of NS records
					res.header.ancount = ipv4s.length;
					for (var j = 0; j < ipv4s.length; j++) {
						res.addRR(name,TTL,"IN","A",ipv4s[j]);
					} 
					res.addRR(name, 10, "IN", "NS", 'ns1.fasterized.com');
				}
				else {
					res.header.nscount = 1;		// number of NS records
					res.header.ancount = ipv6s.length;
					for (var j = 0; j < ipv6s.length; j++) {
						res.addRR(name,TTL,"IN","AAAA",ipv6s[j]);
					} 
					res.addRR(name, 10, "IN", "NS", 'ns1.fasterized.com');
				}
			}
			//send null response to queries other than A or AAAA
			else {
				res.header.ancount = 0;
			}
		}
	res.send();
	}
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

dnsServer.bind(BIND_PORT);
