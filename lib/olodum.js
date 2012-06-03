/* TODO :
 - local cache
*/

// requires
var log = require('./log').logMsg, 
    ndns = require('ndns'),
    env = require('./env');

var dnsServer = ndns.createServer('udp4');
var client = ndns.createClient('udp4');

// Const
var TTL = 5; // default TTL

//mini conf
var domain = '';
var target = '127.0.0.1';
var originalDNS = "208.67.222.222" //openDNS

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

    // only respond to query containing 'domain', otherwise proxy request
    if (name.indexOf(domain) !== -1) {
      res.header.ancount = 1;
      res.header.nscount = 0;
      res.addRR(name,TTL,"IN","A",target);
      res.send();
    }
    else {
      var c_req = client.request(53, originalDNS);
      //set Recursive Desire bit (to resolve CNAME for example)
      req.setHeader({rd: 1});
      c_req.on("response", function (c_res) {
        //in case of error, answer 127.0.0.1
        //if (error !== null) {
        //}
        //hook DNS response with local IP if response contains domain (CNAME)
        for (var j = 0 ; j < c_res.rr.length ; j++) {
          if (c_res.rr[j].type !== 2 && c_res.rr[j].name.indexOf(domain) !== -1) {
            c_res.rr[j].rdata.a = target;
            c_res.rr[j].rdata[0] = target;
          }
        }
        res.send(c_res);
        });
      c_req.send(req);
    }
  }
};

exports.init = function (filterDomain, targetIP, callback) {
  var that = this;

  //get originalDNS
  env.getOriginalDNS( function(res){
    originalDNS = res;

    if (filterDomain) {
      domain = filterDomain;
    }
    if (targetIP) {
      if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(targetIP)) {
        target = targetIP;
        that.start(callback);
      }
      else { //need to resolve first if target is a domain
        require('dns').resolve(targetIP, 'A', function (err, addresses) {
          if (err) {
            log(err.toString() + ' => Olodum exiting');
            process.exit(1);
          }
          target = addresses[0];
          that.start(callback);
        });
      } 
    }
    else {//no target defined, then default target
      that.start(callback);
    }
  });
};

exports.start = function (callback) {
  var that = this;
  log('Starting process ' + process.pid);
  dnsServer.on("request", mainListener);
  dnsServer.on("listening", function () {
    log('Olodum listening on port 53');
    log('Olodum forwarding domain ' + domain + ' to ' + target);
    that.started = true;
  });
  dnsServer.bind(53);
  env.setLocal();                 

  //unregister local DNS server on exit else just trap exception
  process.stdin.resume();

  process.on('SIGINT', this.stop);
  process.on('SIGTERM', this.stop);

  if (typeof callback === 'function') callback();
};

exports.stop = function () {
  log('Stopping Olodum Server ...');
  env.unsetLocal();
};

