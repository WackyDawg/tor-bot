import "dotenv/config";
import express from "express";
import { Client, GatewayIntentBits } from "discord.js";

import { runBot, stopBot, takeScreenshotAndSendToDiscord } from "./bot.js";

const app = express();
const PORT = process.env.PORT || 7860;

// Run bot on server start
app.get("/start", async (req, res) => {
  try {
    await runBot();
    res.send("✅ Bot started");
  } catch (err) {
    res.status(500).send("❌ Failed to start bot: " + err.message);
  }
});

app.get("/", async (req, res) => {
  res.send("🤖 Bot is running");
});

// Stop bot
app.get("/stop", async (req, res) => {
  try {
    await stopBot();
    res.send("🛑 Bot stopped");
  } catch (err) {
    res.status(500).send("❌ Failed to stop bot: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Express server listening on http://localhost:${PORT}`);
});

// Set up Discord bot
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

discordClient.once("ready", () => {
  console.log(`🤖 Logged in as ${discordClient.user.tag}`);
});

discordClient.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const command = message.content.trim();

  if (command === "!screenshot") {
    try {
      await takeScreenshotAndSendToDiscord();
      message.reply("📸 Screenshot taken and sent!");
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to take screenshot");
    }
  }
});

const token = process.env.DISCORD_BOT_TOKEN?.replace(/\+/g, "");
if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN is not set in .env");
  process.exit(1);
}
discordClient.login(token);
