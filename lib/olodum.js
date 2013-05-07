// requires
var log = require('./log').logMsg, 
    dnsd = require('dnsd'),
    constants = require('dnsd/constants'),
    ndns = require('ndns'),
    env = require('./env');

var dnsServer;
var client = ndns.createClient('udp4');

// Const
var TTL = 5; // default TTL

//mini conf
var domains = [''];
var target = '127.0.0.1';
var originalDNS = "208.67.222.222" //openDNS
var debug = false;

function mainListener (req, res) {

  //process all subqueries
  for (var i = 0; i < req.question.length; i++) {
    var question = req.question[i];
    // domain name queried
    var name = (question.name === '.' ? '' : question.name);

    // only respond to A query containing 'domain'
    if (domains.some(function(domainFilter){return name.indexOf(domainFilter) !== -1})) {
      if (debug) {console.log('filtered domain name : ' + name)}
      if (question.type === 'A') {
        res.answer.push({name:name, type:'A', data:target, 'ttl':TTL})
      }
      res.end();
    }
    else {
      //otherwise proxy dns request
      var c_req = client.request(53, originalDNS);
      var message = dnsd.parse(req);
      var clientReq = {
        rinfo: { address: message.connection.remoteAddress, family: 'IPv4', port: message.connection.remotePort, size: 26 },
        length: 0,
        header: { 
          id: message.id,
          qr: 0,
          opcode: 0,
          aa: 0,
          tc: 0,
          rd: 1,
          ra: 0,
          z: 0,
          ad: 0,
          cd: 0,
          rcode: 0,
          qdcount: 1,
          ancount: 0,
          nscount: 0,
          arcount: 0 
        },
        q: {
          '0': {
            name: name,
            type: constants.type(question.type),
            class: 1,
            typeName: question.type,
            className: 'IN' 
          },
          length: 1 
        },
        rr: { length: 0 } 
      } 
      c_req.on("response", function (c_res) {
        //hook DNS response with target IP if response contains domains (CNAME)
        var foundDomainInCname = false;
        for (var j = 0 ; j < c_res.rr.length ; j++) {
          var record = c_res.rr[j];
          if (record.type === 5 && (domains.some(function(domainFilter){return record.rdata.cname.indexOf(domainFilter) !== -1}))) {
            foundDomainInCname = true;
          }
          if (foundDomainInCname && record.type === 1) {
            record.rdata.a = target;
            record.rdata[0] = target;
          }
          if (((record.type === 5 || record.type === 15) && record.name == name) || record.type === 1) {
            res.answer.push({name:name, type:constants.type(record.type), data:record.rdata[0], 'ttl':TTL})
          }
        }
        res.end();
        });
      if (debug) {console.log('requesting nonfiltered domain name : ' + name)}
      c_req.send(clientReq);
    }
  }
};

exports.init = function (filteringDomains, targetIP, debugFlag, callback) {
  var that = this;

  if (debugFlag) {debug = debugFlag;}

  //get originalDNS
  env.getOriginalDNS( function(res){
    originalDNS = res;

    if (filteringDomains) {
      domains = filteringDomains;
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
  dnsServer = dnsd.createServer(mainListener);

  log('Starting process ' + process.pid);
  dnsServer.listen(53,'127.0.0.1', function () {
    log('Olodum listening on port 53');
    log('Olodum forwarding domains ' + domains.join(', ') + ' to ' + target);
    that.started = true;
  });

  process.stdin.resume();

  process.on('SIGINT', this.stop);
  process.on('SIGTERM', this.stop);
  process.on('uncaughtException', function (err) {
    log(err.toString());
    if (/EACCES/.test(err.toString())) {log(' => Olodum must be run with sudo');}
    that.stop()
  });

  //change local entries for DNS servers
  env.setLocal();
  if (typeof callback === 'function') callback();
};

exports.stop = function (callback) {
  log('Stopping Olodum Server ...');
  try {
    var cb = callback ? callback : function () {process.exit(0);};
    env.unsetLocal(cb);
    dnsServer.close();
  }
  catch (e){process.exit(0)};
};

