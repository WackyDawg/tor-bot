const TorRunner = require('./tor/bundle/tor');
const tr = require('tor-request');

let torInstance = null;

function startTorProxy(callback) {
  torInstance = new TorRunner();
  torInstance.on('ready', () => {
    callback?.();
  });
  torInstance.start();
}

function stopTorProxy() {
  if (torInstance) {
    torInstance.stop(); // <- this calls _worker.kill()
    torInstance = null;
    console.log("🛑 Tor process stopped cleanly");
  }
}

function requestThroughTor(url, cb) {
  tr.request(url, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      cb(null, body);
    } else {
      cb(err || new Error(`Status code: ${res?.statusCode}`));
    }
  });
}

module.exports = {
  startTorProxy,
  stopTorProxy,
  requestThroughTor,
};
