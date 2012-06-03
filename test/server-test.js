/*
TODO
 - tests register/unregister local dns server
*/

var vows = require('vows');
var assert = require('assert');
var olodum = require('../lib/olodum');
var exec = require('child_process').exec;

var suite = vows.describe('DNS testing ');
suite.addBatch({
	'Starting olodum server' : {
		topic: function() {
			var cb = this.callback;
			olodum.init(undefined, undefined,function(){setTimeout(cb, 500);});//wait for olodum to start before triggering callback
		},
		'works': function() {
			assert.isTrue(olodum.started);
		}
	}
}).addBatch({
		'and with default config' : {
			'a "www.mycurstomer.org" request should return ': {
		    topic: function () { 
					var cb = this.callback;
					exec('host www.mycurstomer.org', function (error,stdout) {
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
			'a "www.mycustomer.org" AAAA request should return':{
				topic: function(){
					var cb = this.callback;
					exec('host -t "AAAA" www.mycustomer.org', function (error,stdout) {
						cb(error,stdout);
					});
				},
				'with no error': function (err, addresses) {
					assert.isNull(err);
				},
				'and no record defined':function(err, addresses){
			    assert.match(addresses, /[^0-9]*/);
				}
			},
			teardown : function(){
				olodum.stop();
			}
		}
}).export(module);
