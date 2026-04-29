/**
 * @file lib/screenshot.ts
 * @description playwright-core を使った HTML → PNG スクリーンショット処理
 *
 * Dockerfile でインストール済みのシステム Chromium を executablePath で指定して起動する。
 * リクエストごとにブラウザを起動・クローズしてメモリを解放する設計（ブラウザプールは MVP では不要）。
 * ローカル開発時は CHROMIUM_PATH 環境変数で Chromium のパスを指定する。
 */

import { chromium } from 'playwright-core';
import { existsSync } from 'fs';

/** スクリーンショットの幅（px） */
const SLIDE_WIDTH = 800;

/** スクリーンショットの高さ（px） */
const SLIDE_HEIGHT = 450;

/**
 * HTML 文字列を受け取り PNG バッファを返す
 * @param html - 800×450px のスライド HTML
 * @returns PNG バイナリバッファ
 */
/** macOS でよく存在するブラウザパスの候補（優先順） */
const MAC_BROWSER_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/opt/homebrew/bin/chromium',
  '/usr/local/bin/chromium',
];

export async function captureHtml(html: string): Promise<Buffer> {
  // CHROMIUM_PATH 環境変数（存在確認済み）→ macOS 候補 → Docker デフォルトの順で解決
  const envPath = process.env.CHROMIUM_PATH;
  const executablePath =
    (envPath && existsSync(envPath) ? envPath : null) ??
    MAC_BROWSER_CANDIDATES.find((p) => existsSync(p)) ??
    '/usr/bin/chromium';

  const browser = await chromium.launch({
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Docker の /dev/shm が小さい場合の対策
    ],
  });

  try {
    const page = await browser.newPage();

    // ビューポートをスライドサイズに固定
    await page.setViewportSize({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT });

    // HTML 文字列を直接ロード（ファイル不要）
    await page.setContent(html, { waitUntil: 'networkidle' });

    // Retina 対応（deviceScaleFactor: 2 → 実質 1600×900px の PNG が生成される）
    const buffer = await page.screenshot({
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
      },
    });

    return buffer;
  } finally {
    // 必ずブラウザを閉じてメモリを解放する
    await browser.close();
  }
}
