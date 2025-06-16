FROM ghcr.io/puppeteer/puppeteer:22.10.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

RUN git clone https://github.com/your-username/your-repo.git

RUN mkdir -p public && chmod -R 777 public && \
    chmod +x /usr/src/app/puppeteer-device/onion-proxy/tor/bundle/linux/tor/tor

WORKDIR /usr/src/app/your-repo

RUN npm install

CMD ["node", "bot.js"]
