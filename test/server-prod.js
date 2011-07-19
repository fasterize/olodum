/*
TODO
 - integrate with server.js (require + process.env.NODE_ENV ?) : launch server.js before and check everything is ok
*/

var vows = require('vows');
var assert = require('assert');
var	dns = require('dns');

vows.describe('DNS testing in a PROD env').addBatch({
		'In a PROD Env,' : {
			'a "www.monclient.org" request should return ': {
		        topic: function () { 
		       		dns.resolve4("www.monclient.org", this.callback);
		       	},
		        'with no error': function (err, addresses) {
					assert.isArray(addresses);
					assert.isNull(err);
		        },
		        'and with returned IP = 31.222.176.200': function (err, addresses) {
					assert.equal(addresses, "31.222.176.200");
		        }
			},
			'a "www-org.monclient.org" request should return ' : {
				topic: function() {
					dns.resolve4("www-org.monclient.org", this.callback);
				},
		        'with no error': function (err, addresses) {
					assert.isArray(addresses);
					assert.isNull(err);
		        },
		        'and with returned IP = 88.190.23.8': function (err, addresses) {
					assert.equal(addresses, '88.190.23.8');
		        }
			},
			'a "www.monclient.org" AAAA request should return':{
				topic: function(){
					dns.resolve("www.monclient.org", "AAAA",this.callback);
				},
				'an error': function (err, addresses) {
					assert.isNotNull(err);
				},
				'and no record defined':function(err, addresses){
			        assert.isUndefined(addresses);
				}
			},
			'a "toto.fasterized.com" NS request should return ns1.fasterized.com': {
				topic: function(){
					dns.resolve("toto.fasterized.com", "NS",this.callback);
				},
				'with no error' : function (err, addresses) {
					assert.isNull(err);
				},
				'and a record defined as ns1.fasterized.com' : function(err, addresses){
			        assert.equal(addresses,'ns1.fasterized.com');
				}
			},
			'a "tata.fasterized.com" A request should return ': {
				topic: function(){
					dns.resolve4("tata.fasterized.com", this.callback);
				},
				'with no error' : function (err, addresses) {
					assert.isNull(err);
				},
				'and a record defined as 31.222.176.200' : function(err, addresses){
			        assert.equal(addresses,'31.222.176.200');
				}
			}
		}
}).export(module);