FROM ghcr.io/puppeteer/puppeteer:22.10.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Switch to root to install git
USER root

# Install git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Clone the GitHub repo
RUN git clone https://github.com/WackyDawg/tor-bot.git

# Ensure public folder exists and Tor binary is executable
RUN mkdir -p public && chmod -R 777 public && \
    chmod +x /usr/src/app/tor-bot/onion-proxy/tor/bundle/linux/tor/tor

# Change to the repo directory
WORKDIR /usr/src/app/tor-bot

# Install dependencies
RUN npm install

# EXPOSE the port your app runs on
EXPOSE 7860

# OPTIONAL: Switch back to default non-root user (puppeteer uses this)
USER pptruser

# Start the bot
CMD ["node", "start.js"]
