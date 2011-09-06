/*
TODO
 - tests register/unregister local dns server
*/

var vows = require('vows');
var assert = require('assert');
var suite = vows.describe('DNS testing in a DEV env');
var olodum = require('../olodum').olodum;
var exec = require('child_process').exec;

suite.addBatch({
	'Starting olodum server' : {
		topic: function() {
			var cb = this.callback;
			process.env.NODE_ENV = 'dev';
			olodum.init().start(function(){
				setTimeout(cb, 500);
			});
		},
		'works': function() {
			assert.isTrue(olodum.started);
		}
	}
}).addBatch({
		'In a DEV Env,' : {
			'a "www.monclient.org" request should return ': {
		        topic: function () { 
					var cb = this.callback;
					exec('host www.monclient.org', function (error,stdout) {
						cb(error,stdout);
					});
		       	},
		        'with no error': function (err, addresses) {
					//assert.isArray(addresses);
					assert.isNull(err);
		        },
		        'and with returned IP = 127.0.0.1': function (err, addresses) {
					assert.include(addresses, "127.0.0.1");
		        }
			},
			'a "www-org.monclient.org" request should return ' : {
				topic: function() {
					var cb = this.callback;
					exec('host www-org.monclient.org', function (error,stdout) {
						cb(error,stdout);
					});
					//dns.resolve4("www-org.monclient.org", this.callback);
				},
		        'with no error': function (err, addresses) {
					//assert.isArray(addresses);
					assert.isNull(err);
		        },
		        'and with returned IP = 88.190.23.8': function (err, addresses) {
					assert.include(addresses, '88.190.23.8');
		        }
			},
			'a "www.monclient.org" AAAA request should return':{
				topic: function(){
					var cb = this.callback;
					exec('host -t "AAAA" www.monclient.org', function (error,stdout) {
						cb(error,stdout);
					});
					//dns.resolve("www.monclient.org", "AAAA",this.callback);
				},
				'with no error': function (err, addresses) {
					assert.isNull(err);
				},
				'and no record defined':function(err, addresses){
			        assert.match(addresses, /[^0-9]*/);
				}
			},
			/*'a "toto.fasterized.com" NS request should return ns1.fasterized.com': {
				topic: function(){
					var cb = this.callback;
					exec('host -t "NS" toto.fasterized.com', function (error,stdout) {
						cb(error,stdout);
					});
					//dns.resolve("toto.fasterized.com", "NS",this.callback);
				},
				'with no error' : function (err, addresses) {
					assert.isNull(err);
				},
				'and a record defined as ns1.fasterized.com' : function(err, addresses){
			        assert.include(addresses,'ns1.fasterized.com');
				}
			},*/
			'a "tata.fasterized.com" A request should return ': {
				topic: function(){
					var cb = this.callback;
					exec('host tata.fasterized.com', function (error,stdout) {
						cb(error,stdout);
					});
					//dns.resolve4("tata.fasterized.com", this.callback);
				},
				'with no error' : function (err, addresses) {
					assert.isNull(err);
				},
				'and a record defined as 127.0.0.1' : function(err, addresses){
			        assert.include(addresses,'127.0.0.1');
				}
			},
			teardown : function(){
				olodum.stop();
			}
		}
}).export(module);