const TorRunner = require('./tor');
const tor = new TorRunner();

tor.on('ready', () => {
  console.log('Tor network is ready!');
});

tor.start();
