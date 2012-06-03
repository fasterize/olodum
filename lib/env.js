//TODO :  manual TCP/IP and non wifi conf for macosx
//        windows
//        async getos can lead to race condition

var exec = require('child_process').exec,
    log = require('./log').logMsg,
    osType = require('os').type();
var osVersion = '';

//detect macosx version, beware .... async ...
if (osType === 'Darwin') {
  exec('sw_vers -productVersion', function(err, stdout) {
    osVersion = stdout.split('.').splice(0,2).join('.');
  });
}

var cmdGet = {
  Darwin: 'grep "nameserver" /etc/resolv.conf | grep -o -m 1 "[0-9]*\\.[0-9]*\\.[0-9]*\\.[0-9]*"',
  Linux: 'grep "nameserver" /etc/resolv.conf | grep -o -m 1 "[0-9]*\\.[0-9]*\\.[0-9]*\\.[0-9]*"'
};

var cmdUnset = {
  Darwin: {
    '10.6': 'Networksetup -setdnsservers "AirPort" "Empty"',
    '10.7': 'Networksetup -setdnsservers "Wi-Fi" "Empty"'
  },
  Linux: 'mv -f /etc/resolv.conf.orig /etc/resolv.conf'
};

var cmdSet = {
  Darwin: {
    '10.6': 'Networksetup -setdnsservers "AirPort" "127.0.0.1"',
    '10.7': 'Networksetup -setdnsservers "Wi-Fi" "127.0.0.1"'
  },
  Darwin: 'networksetup -setdnsservers "AirPort" "127.0.0.1"',
  Linux: 'mv /etc/resolv.conf /etc/resolv.conf.orig && echo "nameserver 127.0.0.1" >> /etc/resolv.conf'
};

exports.getOriginalDNS = function (cb) {
  var cmd = cmdGet[osType][osVersion] || cmdGet[osType];
  exec(cmd, function (err, stdout) {
    cb(stdout.trim());
  });
};

exports.setLocal = function () {
  //register as a local DNS 
  var cmd = cmdSet[osType][osVersion] || cmdSet[osType];
  exec(cmd, function (error) {
    if (error !== null) {
      log('exec error: ' + error);
      log("DNS rules can't be modified" );
      process.exit(0);
    }
    log('Local Nameserver rules has been added');
    
  });
};

exports.unsetLocal = function () {
    var cmd = cmdUnset[osType][osVersion] || cmdUnset[osType];
    exec(cmd, function (error) {
        if (error !== null) {
          log('exec error: '.red + error);
        }
        log('Local nameserver has been removed. Now exit');
        process.exit(0);
    });
};
