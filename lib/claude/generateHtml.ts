/**
 * @file lib/claude/generateHtml.ts
 * @description プロンプト③：HTMLスライド生成
 *
 * AI_PROVIDER 環境変数で選択されたプロバイダを使って HTML を生成する。
 */

import { getAIProvider } from '@/lib/ai/factory';
import type { ImageProposal, ThemeName } from '@/types';

const THEME_STYLES: Record<ThemeName, string> = {
  tech: `
    :root {
      --bg-primary: #0f172a; --bg-secondary: #1e293b;
      --text-primary: #f1f5f9; --text-secondary: #94a3b8;
      --accent: #38bdf8; --border: #334155;
      --font-family: 'JetBrains Mono', 'Noto Sans JP', monospace;
      --border-radius: 4px;
    }`,
  minimal: `
    :root {
      --bg-primary: #ffffff; --bg-secondary: #f8fafc;
      --text-primary: #0f172a; --text-secondary: #475569;
      --accent: #000000; --border: #e2e8f0;
      --font-family: 'Noto Sans JP', sans-serif;
      --border-radius: 0px;
    }`,
  warm: `
    :root {
      --bg-primary: #fffbf5; --bg-secondary: #fef3e8;
      --text-primary: #1c1917; --text-secondary: #78716c;
      --accent: #f97316; --border: #fed7aa;
      --font-family: 'Noto Sans JP', sans-serif;
      --border-radius: 16px;
    }`,
};

/**
 * 1件の提案に対応する HTML スライドを生成する
 * @param proposal - 対象の ImageProposal
 * @param theme    - 選択されたデザインテーマ
 * @returns 800×450px の完全な HTML 文字列
 */
export async function generateHtml(
  proposal: ImageProposal,
  theme: ThemeName
): Promise<string> {
  const systemPrompt = `あなたはHTMLスライド生成エキスパートです。
以下の仕様を満たす完全なHTMLファイルを1つ返してください。
- サイズ：width: 800px, height: 450px（CSSで!important固定）
- 文字エンコード：UTF-8（<meta charset="UTF-8"> 必須）
- 日本語フォント：Google Fonts CDN経由で Noto Sans JP を読み込む
- 内容：与えられた提案の内容を図解で美しく表現する
- HTMLのみを返すこと（\`\`\`html などのコードブロック・説明文は不要）
- body にはスクロールバーを表示しない（overflow: hidden）

テーマCSS変数（:root に設定済み）：
${THEME_STYLES[theme]}`;

  const ai = getAIProvider();
  const raw = await ai.chat(systemPrompt, JSON.stringify(proposal, null, 2), 8192);

  // プロバイダによってはコードブロックが付くため除去する
  return raw
    .replace(/^```html\n?/, '')
    .replace(/\n?```$/, '');
}
