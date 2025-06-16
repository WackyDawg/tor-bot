const puppeteer = require("puppeteer");
const Tor = require("./onion-proxy/tor/bundle/tor.js");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

let browser;
let tor;
let page;

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

async function runBot() {
  const app = {
    logger: {
      info: console.log,
      error: console.error,
    },
  };

  tor = new Tor(app);
  tor.start();
  await new Promise((resolve) => tor.once("ready", resolve));

  console.log("✅ Tor is ready! Launching Puppeteer...");

  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--ignore-certificate-errors",
      "--proxy-server=socks5://127.0.0.1:9050",
      "--disable-features=site-per-process",
    ],
  });

  page = await browser.newPage();
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
  await page.setCookie({
    name: "auth-token",
    value: "zrocrjv3c4yesa99aus7v5lha30af2",
  });

  await page.reload({ waitUntil: ["networkidle2", "domcontentloaded"] });
}

async function stopBot() {
  if (browser) await browser.close();
  if (tor) tor.stop();
}

async function takeScreenshotAndSendToDiscord() {
  if (!page) throw new Error("Page not ready");

  const screenshotPath = `screenshot-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const form = new FormData();
  form.append("file", fs.createReadStream(screenshotPath));

  try {
    await axios.post(WEBHOOK_URL, form, {
      headers: form.getHeaders(),
    });
    console.log("✅ Screenshot sent to Discord");
  } catch (err) {
    console.error("❌ Screenshot upload failed:", err.message);
  } finally {
    fs.unlinkSync(screenshotPath);
  }
}

module.exports = {
  runBot,
  stopBot,
  takeScreenshotAndSendToDiscord,
};
