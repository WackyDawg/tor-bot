import puppeteer from "puppeteer";
import onionProxy from "./onion-proxy/app.js";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

let browser;
let page;

async function runBot() {
  try {
    await new Promise((resolve) => {
      onionProxy.startTorProxy(async () => {
        console.log("✅ Tor proxy started");
        resolve();
      });
    });

    // Verify Tor IP
    const identity = await new Promise((resolve, reject) => {
      onionProxy.requestThroughTor(
        "https://ip-api.io/json",
        (err, res) => (err ? reject(err) : resolve(JSON.parse(res)))
      );
    });

    console.log(`🧅 Tor IP: ${identity.ip}, Country: ${identity.country_name}`);

    console.log("🚀 Launching Puppeteer through Tor...");

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
      value: "zrocrjv3c4yesa99aus7v5lha30af2", // WARNING: hardcoded token
    });

    await page.reload({ waitUntil: ["networkidle2", "domcontentloaded"] });

    console.log("🎯 Page loaded and prepared");
  } catch (err) {
    console.error("❌ Error during bot run:", err.message);
  }
}

async function stopBot() {
  if (browser) await browser.close();
  onionProxy.stopTorProxy();
  console.log("🛑 Browser closed and Tor stopped");
}

async function takeScreenshotAndSendToDiscord() {
  if (!page) throw new Error("Page not initialized.");

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
    console.error("❌ Failed to send screenshot:", err.message);
  } finally {
    fs.unlinkSync(screenshotPath);
  }
}

export { runBot, stopBot, takeScreenshotAndSendToDiscord };
