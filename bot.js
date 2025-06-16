const puppeteer = require("puppeteer");
const Tor = require("./onion-proxy/tor/bundle/tor.js");

(async () => {
  const app = {
    logger: {
      info: console.log,
      error: console.error,
    },
  };

  const tor = new Tor(app);
  tor.start();

  // Wait for the 'ready' event
  await new Promise((resolve) => tor.once("ready", resolve));

  console.log("✅ Tor is ready! Launching Puppeteer...");
  const authToken = "zrocrjv3c4yesa99aus7v5lha30af2";
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--ignore-certificate-errors",
      "--ignore-certificate-errors-spki-list",
      "--disable-gpu",
      "--disable-infobars",
      "--window-position=0,0",
      "--ignore-certifcate-errors",
      "--ignore-certifcate-errors-spki-list",
      "--disable-speech-api",
      //"--disable-background-networking", // Disable several subsystems which run network requests in the background. This is for use 									  // when doing network performance testing to avoid noise in the measurements. ↪
      //"--disable-background-timer-throttling", // Disable task throttling of timer tasks from background pages. ↪
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-client-side-phishing-detection",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-dev-shm-usage",
      "--disable-domain-reliability",
      "--disable-extensions",
      "--disable-features=AudioServiceOutOfProcess",
      "--disable-hang-monitor",
      "--disable-ipc-flooding-protection",
      "--disable-notifications",
      "--disable-offer-store-unmasked-wallet-cards",
      "--disable-popup-blocking",
      "--disable-print-preview",
      "--disable-prompt-on-repost",
      "--disable-renderer-backgrounding",
      "--disable-setuid-sandbox",
      "--disable-sync",
      "--hide-scrollbars",
      "--ignore-gpu-blacklist",
      "--metrics-recording-only",
      "--mute-audio",
      "--no-default-browser-check",
      "--no-first-run",
      "--no-pings",
      "--no-sandbox",
      "--no-zygote",
      "--password-store=basic",
      "--use-gl=swiftshader",
      "--use-mock-keychain",
      "--proxy-server=socks5://127.0.0.1:9050",
      "--disable-features=site-per-process",
    ],
  });

  const page = await browser.newPage();
  const cookies = [
    {
      name: "auth-token",
      value: authToken,
    },
  ];

  await page.goto("https://www.twitch.tv/d4rk5ide56160", {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });
  await page.evaluate(() => {
    localStorage.setItem("mature", "true");
    localStorage.setItem("video-muted", '{"default":false}');
    localStorage.setItem("volume", "0.5");
    localStorage.setItem("video-quality", '{"default":"160p30"}');
  });

  await page.setViewport({ width: 1280, height: 720 });
  await page.setCookie(...cookies);
  await page.reload({
    waitUntil: ["networkidle2", "domcontentloaded"],
  });
  // const ip = await page.evaluate(() => document.body.innerText.trim());
  // console.log('Your Tor IP is:', ip);

  // await browser.close();
  // tor.stop();
})();
