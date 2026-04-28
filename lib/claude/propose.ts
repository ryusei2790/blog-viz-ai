/**
 * @file lib/claude/propose.ts
 * @description プロンプト②：画像挿入提案生成
 *
 * AI_PROVIDER 環境変数で選択されたプロバイダを使って提案を生成する。
 */

import { getAIProvider } from '@/lib/ai/factory';
import type { AnalysisResult, ImageProposal, VisualType } from '@/types';
import { randomUUID } from 'crypto';

interface RawProposal {
  id: string;
  sectionId: string;
  insertPosition: 'before' | 'after';
  paragraphIndex: number;
  visualType: string;
  reason: string;
  priority: number;
  content: {
    title: string;
    elements: string[];
  };
}

/**
 * 解析結果をもとに画像挿入提案を生成する
 * @param analysisResult - analyzeText() の戻り値
 */
export async function proposeImages(
  analysisResult: AnalysisResult
): Promise<ImageProposal[]> {
  const systemPrompt = `あなたはブログ記事に最適な解説画像を提案するエキスパートです。
与えられた解析結果をもとに、視覚化すべき箇所を特定してJSONを返してください。
必ず有効なJSONのみを返し、説明文・コードブロック・マークダウン装飾は含めないこと。
提案は最大10件まで。visualScore が高いセクションを優先してください。

出力形式：
[
  {
    "id": "p1",
    "sectionId": "s1",
    "insertPosition": "before | after",
    "paragraphIndex": 0,
    "visualType": "flowchart | comparison | steps | concept | code",
    "reason": "なぜここに画像が必要か",
    "priority": 5,
    "content": {
      "title": "図のタイトル",
      "elements": ["要素1", "要素2"]
    }
  }
]`;

  const ai = getAIProvider();

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw_text = await ai.chat(
      systemPrompt,
      JSON.stringify(analysisResult, null, 2),
      4096
    );

    try {
      const raw: RawProposal[] = JSON.parse(raw_text);

      return raw.map((r) => ({
        id: r.id || randomUUID(),
        sectionId: r.sectionId,
        insertPosition: r.insertPosition,
        paragraphIndex: r.paragraphIndex ?? 0,
        visualType: r.visualType as VisualType,
        reason: r.reason,
        priority: Math.min(5, Math.max(1, r.priority)) as ImageProposal['priority'],
        content: {
          title: r.content.title,
          elements: r.content.elements,
        },
        proposedAt: new Date(),
      }));
    } catch {
      if (attempt === 1) {
        throw new Error(`提案レスポンスを JSON としてパースできませんでした: ${raw_text}`);
      }
    }
  }

  throw new Error('proposeImages: 予期しない状態');
}
