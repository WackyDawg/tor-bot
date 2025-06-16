require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const {
  runBot,
  stopBot,
  takeScreenshotAndSendToDiscord,
} = require("./bot");

const app = express();
const PORT = process.env.PORT || 3000;

// Run bot on server start
app.get("/start", async (req, res) => {
  try {
    await runBot();
    res.send("✅ Bot started");
  } catch (err) {
    res.status(500).send("❌ Failed to start bot: " + err.message);
  }
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

const token = process.env.DISCORD_BOT_TOKEN.replace(/\+/g, '');
discordClient.login(token);
