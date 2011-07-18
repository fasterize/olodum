/* TODO : 
 - DEV ENV : add this server as a default DNS system server when starting and remove when quit or interrupt
 - tests
 - refactor ipv4/ipv6/ns
 - separate local/dev environnement
 - isolate resolver
 - use a configuration file
 - log with a syslog-like utility (ain ?)

process.env.NODE_DEV only accessible in sudo if added to the user env variable then exported :
$ NODE_ENV=dev
$ export NODE_ENV
$ sudo visudo
=> add this line
Defaults        env_keep += "NODE_ENV"
*/

// nodejs requires
var os = require('os'),
		exec = require('child_process').exec;
	
// requires
var ndns = require('./lib/ndns');
var dnsServer = ndns.createServer('udp4');
var client = ndns.createClient('udp4');


var TTL = 5; // default TTL in DEV ENV
var REMOTE_HOST = "208.67.222.222" //openDNS
var REMOTE_PORT = 53;
var BIND_PORT = 53;
var isDev = (process.env.NODE_ENV == 'dev');

var osType = os.type();

//if ENV DEV, register as a local DNS
if(isDev){
	if(osType === "Linux") {// Linux
		// Create a backup 
		fs.writeFileSync("/etc/resolv.conf.orig",fs.readFileSync("/etc/resolv.conf"), function (err) {
		  if (err) throw err;
		});
		// Edit resolv.conf
		fs.readFile('/etc/resolv.conf.orig', function (err, data) {
		  if (err) throw err;
		  toWrite = data+"\nnameserver 127.0.0.1";
		  fs.writeFile('/etc/resolv.conf', data, function(err){
		    if (err) throw err;
		    console.log('resolv.conf file has been updated!');
		  });
		});
	} 
	if( osType === "Darwin"){ //Macs
		// Change DNS IP with networksetup
		child = exec('networksetup -setdnsservers "AirPort" 127.0.0.1',
		  function (error) {
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
		    console.log('networksetup rules has been added');
		});	
	
	}
	//if windows, double gloups
}


// Temp : IP in the code, not in a global conf
var ipv4s = [];
if (!isDev) {
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

	//process all subqueries
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

		// only respond to query ending with fasterized.com, otherwise proxy request
		if (!isDev) {
			var type = req.q[i].type
			// This server only respond to A or AAAA or NS query
			if (type == ndns.ns_type.ns_t_a || (type == ndns.ns_type.ns_t_aaaa && ipv6s.length > 0) || (type == ndns.ns_type.ns_t_ns) ) {

				//add all records in ips array to response 
				if (type == ndns.ns_type.ns_t_a) {
					res.header.nscount = 1;		// number of NS records
					res.header.ancount = ipv4s.length;
					for (var j = 0; j < ipv4s.length; j++) {
						res.addRR(name,TTL,"IN","A",ipv4s[j]);
					} 
					res.addRR(name, 10, "IN", "NS", 'ns1.fasterized.com');
				}
				else if (type == ndns.ns_type.ns_t_aaaa){
					res.header.nscount = 1;		// number of NS records
					res.header.ancount = ipv6s.length;
					for (var j = 0; j < ipv6s.length; j++) {
						res.addRR(name,TTL,"IN","AAAA",ipv6s[j]);
					} 
					res.addRR(name, 10, "IN", "NS", 'ns1.fasterized.com');
				}
				else if (type == ndns.ns_type.ns_t_ns) {
					res.header.nscount = 1;		// number of NS records
					res.header.ancount = 1;
					res.addRR(name, 10, "IN", "NS", 'ns1.fasterized.com');					
					res.addRR('ns1.fasterized.com', 10, "IN", "A", '31.222.176.247');
				}
			}
			//send 0 response to queries other than A / AAAA / NS
			else {
				res.header.ancount = 0;
			}
			res.send();
		}
		//DEV ENV : proxy request DNS except "fasterized.com" domains
		else {
			var c_req = client.request(REMOTE_PORT, REMOTE_HOST);
			//set Recursive Desire bit (to resolve CNAME for example)
			req.setHeader({
			rd: 1
			});
		    c_req.on("response", function (c_res) {
				//hook DNS response with local IP if "fasterized.com" domain
				for (var j = 0 ; j < c_res.rr.length ; j++) {
					if (c_res.rr[j].name.indexOf('.fasterized.com') != -1) {
						c_res.rr[j].rdata.a = '127.0.0.1'
						c_res.rr[j].rdata[0] = '127.0.0.1'
					}
				}
				res.send(c_res);
		    });
		    c_req.send(req);
		}
	}
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

//if DEV ENV, unregister local DNS server on exit
if (isDev) {
	process.stdin.resume();
	
	process.on('SIGINT', function() {
	  console.log('Detected closing signal.  Press Control-D to exit.');
	  if(osType === "Linux"){
			// Restore resolv.conf
			fs.writeFileSync("/etc/resolv.conf",fs.readFileSync("/etc/resolv.conf.orig"), function (err) {
			  if (err) throw err;
			});
			fs.unlink("/etc/resolv.conf.orig");
			
	  }
	  if(osType === "Darwin"){
	  	child = exec('networksetup -setdnsservers "AirPort" "Empty"',
	  	  function (error) {
	  	    if (error !== null) {
	  	      console.log('exec error: ' + error);
	  	    }
	  	    console.log('networksetup rules has been removed');
	  	});	
	  }
	  
	  // Wait for the async task to ends then kill process
	  setTimeout(function () {
	    console.log('Stopping nDNS...');
	    process.exit(0);
	  }, 500);
	});
}

console.log('Starting process '+ process.pid +' in environment : ' + process.env.NODE_ENV + ' on port ' + BIND_PORT);
dnsServer.bind(BIND_PORT);
