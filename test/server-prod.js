var vows = require('vows');
var assert = require('assert');
var suite = vows.describe('DNS testing in a PROD env');
var olodum = require('../olodum').olodum;
var exec = require('child_process').exec;

suite.addBatch({
	'Starting olodum server' : {
		topic: function() {
			var cb = this.callback;
			process.env.NODE_ENV = 'prod';
			olodum.init().start(function(){
				setTimeout(cb, 500);
			});
		},
		'works': function() {
			assert.isTrue(olodum.started);
		}
	}
}).addBatch({
		'In a PROD Env,' : {
			'a "www.monclient.org" request should return ': {
		        topic: function () { 
					var cb = this.callback;
					exec('host www.monclient.org 127.0.0.1', function (error,stdout) {
						cb(error,stdout);
					});
		       	},
		        'with no error': function (err, addresses) {
					//assert.isArray(addresses);
					assert.isNull(err);
		        },
		        'and with returned IP = 31.222.182.138': function (err, addresses) {
					assert.include(addresses, "31.222.182.138");
		        }
			},
			'a "www-org.monclient.org" request should return ' : {
				topic: function() {
					var cb = this.callback;
					exec('host www-org.monclient.org  127.0.0.1', function (error,stdout) {
						cb(error,stdout);
					});
					//dns.resolve4("www-org.monclient.org", this.callback);
				},
		        'with no error': function (err, addresses) {
					//assert.isArray(addresses);
					assert.isNull(err);
		        },
		        'and with returned IP = 31.222.182.138': function (err, addresses) {
					assert.include(addresses, '31.222.182.138');
		        }
			},
			'a "www.monclient.org" AAAA request should return':{
				topic: function(){
					var cb = this.callback;
					exec('host -t "AAAA" www.monclient.org  127.0.0.1', function (error,stdout) {
						cb(error,stdout);
					});
					//dns.resolve("www.monclient.org", "AAAA",this.callback);
				},
				'with no error': function (err, addresses) {
					assert.isNull(err);
				},
				'and no record defined': function(err, addresses){
			        assert.match(addresses, /[^0-9]*/);
				}
			},
			'a "toto.fasterized.com" NS request should return ns1.fasterized.com': {
				topic: function(){
					var cb = this.callback;
					exec('host -t "NS" toto.fasterized.com 127.0.0.1', function (error,stdout) {
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
			},
			'a "tata.fasterized.com" A request should return ': {
				topic: function(){
					var cb = this.callback;
					exec('host tata.fasterized.com 127.0.0.1', function (error,stdout) {
						cb(error,stdout);
					});
					//dns.resolve4("tata.fasterized.com", this.callback);
				},
				'with no error' : function (err, addresses) {
					assert.isNull(err);
				},
				'and a record defined as 31.222.182.138' : function(err, addresses){
			        assert.include(addresses,'31.222.182.138');
				}
			},
			teardown : function(){
				olodum.stop();
			}
		}
}).export(module);