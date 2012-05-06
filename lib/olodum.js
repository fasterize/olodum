/* TODO :
 - refactor ipv4/ipv6/ns ? (=> use an object ?)
 - move IPs properties to olodum object and not dnsServer object

process.env.NODE_DEV only accessible in sudo if added to the user env variable then exported :
$ NODE_ENV=dev
$ export NODE_ENV
$ sudo visudo
=> add this line
Defaults        env_keep += "NODE_ENV"
*/

// requires
var log = require('./log').logMsg, 
    ndns = require('ndns'),
    env = require('./env');

var dnsServer = ndns.createServer('udp4');
var client = ndns.createClient('udp4');

var isDev = true;

// Const
var TTL = 5; // default TTL in DEV env
var REMOTE_HOST = "208.67.222.222" //openDNS
var REMOTE_PORT = 53;
var BIND_PORT = 53;


function mainListener (req, res) {
		// duplicate query headers in response
	    res.setHeader(req.header);

		//set some response headers
		res.header.aa = 1;         // authoritative answer
		res.header.ra = 0;
		res.header.qr = 1;			// Message type = response
		res.header.rd = 0;
		res.header.arcount = 0;		// number of Additional Records

		// domain name queried
		var name = (req.q[0].name === '.' ? '' : req.q[0].name);

		//process all subqueries
	    for (var i = 0; i < req.q.length; i++) {
			//parse query and add it to the response object
			res.addQuestion(req.q[i]);

			// only respond to query ending with fasterized.com, otherwise proxy request
			if (!isDev) {
				var type = req.q[i].type
				// This server only respond to A or AAAA or NS query
				if (type == ndns.ns_type.ns_t_a || (type == ndns.ns_type.ns_t_aaaa && this.ipv6s.length > 0) || (type == ndns.ns_type.ns_t_ns) ) {
					res.header.nscount = 1;		// number of NS records
					first = ndns.p_type_syms[type];
					//add all records in ips array to response
					if (type == ndns.ns_type.ns_t_a) {
						ips = this.ipv4s;
					}
					else if (type == ndns.ns_type.ns_t_aaaa) {
						ips = this.ipv6s;
					}
					else if (type == ndns.ns_type.ns_t_ns) {
						ips = this.nss;
					}
					//set number of Resource Record
					res.header.ancount = ips.length;
					for (var j = 0; j < ips.length; j++) {
						res.addRR(name,TTL,"IN",first,ips[j]);
					}
					//add an NS record for Authority Response or A record for NS query
					if (first === 'A') {
						res.addRR(name, 10, "IN", "NS", 'ns1.fasterized.com');
					}
					else {
						res.addRR('ns1.fasterized.com', 10, "IN", "A", '31.222.176.247');
					}
				}
				//send 0 response to queries other than A / AAAA / NS
				else {
					res.header.ancount = 0;
				}
				res.send();
			}
			//DEV env : proxy request DNS except "fasterized.com" domains
			else {
				// if it's a .fasterized. domain that is queried, reply always with 127.0.0.1
				if (name.indexOf('.fasterized') !== -1) {
					res.header.ancount = 1;
					res.header.nscount = 0;
					res.addRR(name,TTL,"IN","A","192.168.56.11");
					res.send()
				}
				else {
					var c_req = client.request(REMOTE_PORT, REMOTE_HOST);
					//set Recursive Desire bit (to resolve CNAME for example)
					req.setHeader({rd: 1});
				    c_req.on("response", function (c_res) {
						//in case of error, answer 127.0.0.1
						//if (error !== null) {
						//}
						//hook DNS response with local IP if "fasterized.com" domain (or prospect/client domain)
						for (var j = 0 ; j < c_res.rr.length ; j++) {
							if (c_res.rr[j].type !== 2 && c_res.rr[j].name.indexOf('.fasterized.') !== -1) {
								c_res.rr[j].rdata.a = '127.0.0.1'
								c_res.rr[j].rdata[0] = '127.0.0.1'
							}
						}
						res.send(c_res);
				    });
				    c_req.send(req);
			    }
			}
		}
	};

exports.init = function () {
			isDev = env.isDev();

			// Temp : IP in the code, not in a global conf
			dnsServer.ipv4s = [];
			dnsServer.ipv4s.push('31.222.182.138');
			if (!isDev) TTL=300

			dnsServer.ipv6s = [];
			//ipv6s.push('2002:0:0:0:0:0:1fde:b0c8');
			dnsServer.nss = [];
			dnsServer.nss.push('ns1.fasterized.com');
			return this;
		};

exports.start = function (callback) {
			var that = this;
			log('Starting process '+ process.pid +' in environment : ' + process.env.NODE_ENV);
			dnsServer.on("request", mainListener);
			dnsServer.on("listening", function () {
				log('Olodum listening on port ' + BIND_PORT);
				that.started = true;
			});
			dnsServer.bind(BIND_PORT);
      if (isDev) {
        env.setLocal();                 
      }

			//if DEV env, unregister local DNS server on exit else just trap exception
			if (isDev) {
				process.stdin.resume();
				process.on('SIGINT', this.stop);
				process.on('SIGTERM', this.stop);
			}
			else {
				process.on('uncaughtException', function (err) {
					log('Caught exception: ' + err);
				});
			}
			// wait for calling callback if needed
			// below 1000ms tests started before the whole initialization was done
			if (typeof callback === 'function') callback();
		};

exports.stop = function () {
			log('Stopping Olodum Server ...');
			if (isDev) {
        env.unsetLocal();
			}
			else {
				log('Now exit');
				setTimeout(process.exit,100,0);
			}
		};

