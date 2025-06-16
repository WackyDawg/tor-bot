const os = require("os");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const EventEmitter = require("events");

const PLATFORM = os.platform();

const TOR_PATHS = {
  linux: path.join(__dirname, "linux/tor"),
  win32: path.join(__dirname, "windows/tor/tor.exe")
};

class TorRunner extends EventEmitter {
  constructor() {
    super();
    this.filePath = this.getTorPath();
    this.worker = null;
  }

  getTorPath() {
    if (PLATFORM === "linux") {
      // fs.chmodSync(TOR_PATHS.linux, 0o755); // Ensure executable permission
      return TOR_PATHS.linux;
    } else if (PLATFORM === "win32") {
      return TOR_PATHS.win32;
    } else {
      throw new Error("Unsupported platform: " + PLATFORM);
    }
  }

  start() {
    if (this.worker) {
      console.log("Tor is already running.");
      return;
    }

    console.log("Starting Tor from:", this.filePath);

    this.worker = spawn(this.filePath, []);

    this.worker.stdout.on("data", (data) => {
      const text = data.toString();
      console.log(text);

      if (text.includes("Bootstrapped 100%")) {
        console.log("Tor is ready.");
        this.emit("ready");
      }
    });

    this.worker.stderr.on("data", (data) => {
      console.error("Tor error:", data.toString());
    });

    this.worker.on("exit", (code) => {
      console.log("Tor process exited with code:", code);
      this.worker = null;
    });
  }

  stop() {
    if (this.worker) {
      this.worker.kill();
      this.worker = null;
      console.log("Tor has been stopped.");
    }
  }
}

module.exports = TorRunner;
