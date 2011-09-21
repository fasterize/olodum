OLODUM
======

Requirements
------------

Nodejs 0.4.12 http://nodejs.org/ (Using NVM)
Npm 1.0.27 http://npmjs.org/
Git

See https://github.com/fasterize/FasterizeEngine/wiki/Dev-Environment-Requirements for installation
directives and tips

Cloning project and modules installation
----------------------------------------

```bash
# Your dev directory, choose one, in prod it's /F
cd [directory]

# Clone project & all submodules recursively
git clone git@github.com:fasterize/olodum.git --recursive && cd olodum

# Install all required packages, this will read package.json
npm install

# Done
```

Usage
-----
start with : sudo node server.js

sudo needed to bind to port 53

Tests
-----
sudo sh test-runner.sh

TODO
----
 * Tester le déploiement en prod
 * Ajouter ndns dans un serveur NPM privé ?
 * Renommer le README en README.md ?