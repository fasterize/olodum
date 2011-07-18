var vows = require('vows'),
    assert = require('assert');
		dns = require('dns');


//je teste qu'un domaine fasterized.com donne bien 31.222.176.200
vows.describe('A fasterized.com request returns 31.222.176.200').addBatch({
		'test fasterized.com': {
        topic: function () { 
       		dns.resolve4("fasterized.com", this.callback);
       	},
        'no error returned': function (err, addresses) {
					assert.isArray(addresses);
					assert.isNull(err);
        },
        'check returned IP': function (err, addresses) {
	        assert.notEqual(addresses, undefined);
					assert.equal(addresses, "31.222.176.200");
        }
    }
}).addBatch({
		'test DNS relay':{
			topic: function(){
				dns.resolve4("notfasterized.com", this.callback);
			},
			'no error returned': function (err, addresses) {
				assert.isArray(addresses);
				assert.isNull(err);
			},
			'check returned message is origin':function(err, addresses){
				assert.isEmpty(addresses);
			}
		}
}).export(module);


//je teste qu'un domaine notfasterized.com donne bien l'origine

//je teste qu'une query de type A renvoie un enreg

//je checke qu'une query de type AAAA renvoie un enreg 

//je checke qu'une query de type NS renvoie un enreg

//je checke qu'une query en local donne mon serveur local

//je foire, je continue de renvoyer un record