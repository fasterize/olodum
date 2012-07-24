OLODUM ![olodum logo](https://github.com/fasterize/olodum/blob/master/olodum.png?raw=true)
======

/etc/host made easy.

Tired of editing your /etc/host ? Olodum act as a local filtering DNS proxy : 

 * every DNS request containing a domain name that is configured to be catched will returned the IP you specify, 
 * every other request will be forwarded to your real DNS servers

Why _olodum_ ? Because i'm a fan of Michael. Just look at the video clip "They don't care about us"

Requirements
------------

NodeJS >= v0.4 (http://nodejs.org/)

Modules installation
-----------------
Olodum should be used and installed globally 

    [sudo] npm install olodum -g


Supported env
------------
* linux (ubuntu,debian)
* macosx
* that's all

windows port in the TODO list

Usage
====

    sudo olodum [host1] [host2] [-t target]

where :

* host1, host2 are the filters, default to blank (=> every DNS requests are catched). Can be a part of a hostname
* _target_ is the IP address to respond when a domain name matches _host_, default to ````127.0.0.1````
* if target is not an IP then target is first resolved to an IP address (before olodum is started) 

sudo is needed to bind to local port 53 (DNS server)

You should be able to surf as usual, except for the filtered domain name(s).
When you are finished, just type ````Ctrl + C```` to exit and revert to the previous and original DNS configuration of your box.

#Use cases
##/etc/host replacement
When developping proxy, web or cache servers, inserting lines in /etc/host can quickly be cumbersome and boring. You've got plenty of commented lines, don't know if your configuration is up to date regarding one of the domain names your are testing, you're doing ````host```` and ````dig```` to find real IPs to put in this file, ... 
Just use Olodum !

Want to serve a new www.google.com site ? Just start your local webserver and use :

````sudo olodum www.google.com -t 127.0.0.1````
 
Want to map www.gooooogle.com on www.google.com to see if goog uses vhosts ? Just use :

````sudo olodum www.gooooogle.com -t www.google.com````

##wildcard domain names
If you've got wildcard domain names to point to one IP, you need to enter each line in your /etc/host
With olodum, just use the fixed portion of the domain name in the filter : 

````sudo olodum google````

In this example, every DNS request containing google will be answered with 127.0.0.1 (default IP). It's equivalent to these lines in /etc/host :

    127.0.0.1 www.google.com
    127.0.0.1 mail.google.com
    [.... snip ....]
    127.0.0.1 plus.google.com
    127.0.0.1 maps.google.com

## CNAME
When you're setting up a proxy, a cache, a CDN or even better, a frontend optimizer for your live servers and you want to test if their configuration is ok, instead of using one of the provider IP, use the future used CNAME as the target for olodum :

````sudo olodum www.fasterize.com -t www.fasterize.com.fasterized.org````

and you're ready to go and test your _fasterized_ website !

##blackhole webperf test 
Imagine a world where facebook, google+ or twitter widgets were 100% uptime ... Huh ?!
So, test your website with olodum activated for one of these domains and see the result on the loading time of your site !

````sudo olodum twitter````

##temporary AdBlocker
Start a web server on 127.0.0.1:80

````sudo node -e "require('http').createServer(function(req,res) {res.end('')}).listen(80)"````

Start olodum

````sudo olodum crappyadserver.net````

Hahaha ! bye-bye crappy AdServers !

(Starting the web server will be included in future version of olodum, list of adServers too.)

Tests
===
    sudo npm test

Tests are not complete, must work on it (i think https://github.com/cloudhead/vows/pull/222 should help).

Caveats
=======
Sometimes resolving hosts through olodum will fail and your request will hang. Need to fix this.

Inner working
=============
##linux
1. read and backup /etc/resolv.conf
2. write a new /etc/resolv.conf with 127.0.0.1 as the DNS server
3. start the DNS server
4. serve DNS responses based on filter or forward the request to the first DNS server detected in /etc/resolv.conf

##macosx
1. read and backup /etc/resolv.conf
2. change the network configuration with 127.0.0.1 as the DNS server
3. start the DNS server
4. serve DNS responses based on filter or forward the request to the first DNS server detected in /etc/resolv.conf

TODO
====

 * windows port
 * AdBlocker & blakchole management based on blacklists
 * regex on host
 * tests

Thanks
======
This module is based on this dns library for nodejs : https://github.com/jsjohnst/ndns (no more maintained). This fork is more up-to-date : https://github.com/atrniv/ndns.

Licence
====
Do what you want. Have fun with JS.
