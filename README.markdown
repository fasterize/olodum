OLODUM
======

Full Installation directives (OSX/LINUX)
----------------------------------------

```bash
# Your dev directory, choose one, in prod it's /F
cd [directory]

apt-get install build-essential git curl
# OR
brew install git curl

# NVM (multiple node versions, as suggested by drousselie)
git clone git://github.com/creationix/nvm.git ~/.nvm
echo ". ~/.nvm/nvm.sh" >> ~/.bashrc

nvm install v0.4.12

# NPM
# There's a bug ATM with NPM latest
# Use this method to install an old npm :
cd && git clone https://github.com/isaacs/npm.git && cd npm && git checkout v1.0.27 && sudo make install
# curl http://npmjs.org/install.sh | sh

# Clone project & all submodules recursively
git clone git@github.com:fasterize/olodum.git --recursive && cd olodum

# Install all required packages, this will read package.json
npm install

# Optional, on your local machine for dev purposes
# npm install node-inspector -g
# npm install node-dev -g

# Optional, when in need to launch tests
# npm install vows -g
# npm install http-server -g

# Optional, on your local machine for dev purposes
# git config core.filemode false
# git config color.ui true
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