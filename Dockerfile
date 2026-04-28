# Dockerfile
# Railway デプロイ用（Chromium + 日本語フォント込み）
# architecture.md Section 8 の設計方針に基づく

FROM node:20-slim

# Chromium と日本語フォントのインストール
# playwright-core はシステム Chromium を使うため PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-cjk \
    fonts-ipafont-gothic \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Playwright が Chromium を見つけられるよう環境変数を設定
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CHROMIUM_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
