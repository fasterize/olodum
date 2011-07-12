/* TODO : 
separate local/dev environnement
isolate resolver
*/
var ndns = require('./lib/ndns');
var dnsServer = ndns.createServer('udp4');

var BIND_PORT = 53;
var TTL = 300;
var ipv4s = [];
ipv4s.push('31.222.176.200');
//ipv4s.push('31.222.176.201');
var ipv6s = [];
//ipv6s.push('2002:0:0:0:0:0:1fde:b0c8');

server.on("request", function(req, res) {
    res.setHeader(req.header);
    for (var i = 0; i < req.q.length; i++) {
		res.header.aa = 1	;         // authoritative answer
		res.header.ra = 0;
		res.header.qr = 1;
		res.header.rd = 0;
		res.header.nscount = 0;
		res.header.arcount = 0;
		res.addQuestion(req.q[i]);
		//console.log(req.q[i]);
		// This server only respond to A or AAAA query
		if (req.q[i].type == ndns.ns_type.ns_t_a || (req.q[i].type == ndns.ns_type.ns_t_aaaa && ipv6s.length > 0) ) {
			// domain name queried
			var name = (req.q[0].name === '.' ? '' : req.q[0].name);

			//add all records in ips array to response 
			if (req.q[i].type == ndns.ns_type.ns_t_a) {
				res.header.ancount = ipv4s.length;
				for (var j = 0; j < ipv4s.length; j++) {
					res.addRR(req.q[0].name,j+1,"IN","A",ipv4s[j]);
				} 
			}
			else if (ipv6s.length > 0) {
				res.header.ancount = ipv6s.length;
				for (var j = 0; j < ipv6s.length; j++) {
					res.addRR(name,TTL,"IN","AAAA",ipv6s[j]);
				} 
			}
		}
		//send null response to queries other than A or AAAA
		else {
			res.header.ancount = 0;
		}
	res.send();
	}
});

server.bind(BIND_PORT);
