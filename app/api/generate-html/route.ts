/**
 * @file app/api/generate-html/route.ts
 * @description POST /api/generate-html — HTMLスライド生成 + スクリーンショット API
 *
 * ImageProposal[] とテーマ名を受け取り、各提案に対して
 * Claude で HTML を生成 → playwright-core で PNG 化する。
 * 並列処理（Promise.all）で全提案を同時処理する。
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateHtml } from '@/lib/claude/generateHtml';
import { captureHtml } from '@/lib/screenshot';
import type { ImageProposal, ThemeName, GenerateHtmlResponseItem } from '@/types';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proposals, theme } = body as {
      proposals: ImageProposal[];
      theme: ThemeName;
    };

    if (!proposals || !Array.isArray(proposals) || proposals.length === 0) {
      return NextResponse.json(
        { error: 'proposals フィールドが必要です' },
        { status: 400 }
      );
    }

    if (!theme) {
      return NextResponse.json(
        { error: 'theme フィールドが必要です' },
        { status: 400 }
      );
    }

    // 提案ごとに HTML 生成 + スクリーンショットを並列実行
    const items = await Promise.all(
      proposals.map(async (proposal, index): Promise<GenerateHtmlResponseItem> => {
        const html = await generateHtml(proposal, theme);
        const pngBuffer = await captureHtml(html);
        const filename = `image_${String(index + 1).padStart(2, '0')}.png`;

        return {
          proposalId: proposal.id || randomUUID(),
          filename,
          pngBase64: pngBuffer.toString('base64'),
        };
      })
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[/api/generate-html] エラー:', error);
    return NextResponse.json(
      { error: 'HTML生成・スクリーンショット中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
