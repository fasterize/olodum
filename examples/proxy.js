var ndns = require('../lib/ndns');
var server = ndns.createServer('udp4');
var client = ndns.createClient('udp4');

var LOCAL_PORT = 53;
var REMOTE_HOST = "208.67.222.222"
var REMOTE_PORT = 53;

server.on("request", function(req, res) {
    var c_req = client.request(REMOTE_PORT, REMOTE_HOST);
    c_req.on("response", function (c_res) {
	res.send(c_res);
    });
    c_req.send(req);
});

server.bind(LOCAL_PORT);
console.log(client.bind.toString());
console.log(server.address());
client.bind(53,'208.67.222.222');
