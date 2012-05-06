var exec = require('child_process').exec,
    log = require('./log').logMsg,
    osType = require('os').type();

var cmdUnset = {
    Darwin: 'Networksetup -setdnsservers "AirPort" "Empty"',
    Linux: 'mv -f /etc/resolv.conf.orig /etc/resolv.conf'
};

var cmdSet = {
    Darwin: 'networksetup -setdnsservers "AirPort" "127.0.0.1"',
    Linux: 'mv /etc/resolv.conf /etc/resolv.conf.orig && echo "nameserver 127.0.0.1" >> /etc/resolv.conf'
};

exports.isDev = function () {
  return process.env.NODE_ENV === 'dev'
}; 

exports.setLocal = function () {
  //register as a local DNS (ENV DEV = mac os / Wifi)
  var cmd = cmdSet[osType];
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
    var cmd = cmdUnset[osType];
    exec(cmd, function (error) {
        if (error !== null) {
          log('exec error: '.red + error);
        }
        log('Local nameserver has been removed. Now exit');
        process.exit(0);
    });
};
