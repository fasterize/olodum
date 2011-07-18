var vows = require('vows'),
    assert = require('assert');
		dns = require('dns');

//je teste qu'un domaine client fasterize donne bien 31.222.176.200
vows.describe('DNS testing').addBatch({
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
					//assert.isEmpty(addresses);
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
					//assert.isEmpty(addresses);
				}
			}
		}
}).export(module);


//je teste qu'un domaine notfasterized.com donne bien l'origine

//je teste qu'une query de type A renvoie un enreg

//je checke qu'une query de type AAAA renvoie un enreg 

//je checke qu'une query de type NS renvoie un enreg

//je checke qu'une query en local donne mon serveur local

//je foire, je continue de renvoyer un record