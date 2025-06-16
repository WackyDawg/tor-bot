const request = require('request');
const SocksProxyAgent = require('socks-proxy-agent');
const Tor = require('./onion-proxy/tor/bundle/tor.js');

// Simple logger
const app = {
  logger: {
    info: console.log,
    error: console.error
  }
};

// Start and wait for Tor to be ready
const tor = new Tor(app);

tor.on('ready', () => {
  console.log('✅ Tor Bootstrapped. Making request through Tor...');

  // Define the Tor SOCKS5 proxy
  const torProxy = 'socks5h://127.0.0.1:9050';

  // Create the agent
  const agent = new SocksProxyAgent(torProxy);

  // URL to check your IP
  const url = 'http://icanhazip.com';

  // Make the request through Tor
  request({
    url,
    agent,
    timeout: 10000
  }, (err, res, body) => {
    if (err) {
      console.error('❌ Error making request through Tor:', err.message);
      console.log('\nMake sure Tor is running with:\n$ tor');
      return;
    }

    console.log('🌍 Your Tor IP address is:', body.trim());
    tor.stop();
  });
});

tor.start();
