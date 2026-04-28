/**
 * @file lib/claude/analyze.ts
 * @description プロンプト①：ブログテキスト構造解析
 *
 * AI_PROVIDER 環境変数で選択されたプロバイダを使って解析する。
 * JSON のみを返すよう指示し、パース失敗時は最大1回リトライする。
 */

import { getAIProvider } from '@/lib/ai/factory';
import type { AnalysisResult, Section } from '@/types';
import { randomUUID } from 'crypto';

interface RawSection {
  id: string;
  heading: string;
  body: string;
  contentType: string;
  visualScore: number;
  orderIndex: number;
}

interface RawAnalysisResult {
  theme: string;
  tone: string;
  sections: RawSection[];
}

/**
 * ブログ全文テキストを解析して AnalysisResult を返す
 * @param text        - ユーザーが入力したブログ本文（最大 20,000文字）
 * @param blogInputId - BlogInput の ID（関連付け用）
 */
export async function analyzeText(
  text: string,
  blogInputId: string
): Promise<AnalysisResult> {
  const systemPrompt = `あなたはブログ記事の構造を分析するエキスパートです。
与えられた記事テキストを分析し、以下のJSONを返してください。
必ず有効なJSONのみを返し、説明文・コードブロック・マークダウン装飾は含めないこと。

出力形式：
{
  "theme": "記事のテーマ（例：TypeScript入門）",
  "tone": "technical | lifestyle | business | other",
  "sections": [
    {
      "id": "s1",
      "heading": "見出し",
      "body": "本文",
      "contentType": "steps | concept | comparison | data | case",
      "visualScore": 8,
      "orderIndex": 0
    }
  ]
}`;

  const ai = getAIProvider();

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw_text = await ai.chat(systemPrompt, text, 4096);

    try {
      const raw: RawAnalysisResult = JSON.parse(raw_text);

      const sections: Section[] = raw.sections.map((s) => ({
        id: s.id,
        heading: s.heading,
        body: s.body,
        contentType: s.contentType as Section['contentType'],
        visualScore: s.visualScore,
        orderIndex: s.orderIndex,
      }));

      return {
        id: randomUUID(),
        blogInputId,
        theme: raw.theme,
        tone: raw.tone as AnalysisResult['tone'],
        sections,
        analyzedAt: new Date(),
      };
    } catch {
      if (attempt === 1) {
        throw new Error(`解析レスポンスを JSON としてパースできませんでした: ${raw_text}`);
      }
    }
  }

  throw new Error('analyzeText: 予期しない状態');
}
