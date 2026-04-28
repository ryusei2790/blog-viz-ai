/**
 * @file app/api/export/route.ts
 * @description POST /api/export — ZIP 生成・ダウンロード API
 *
 * スクリーンショット（Base64）と proposals、analysisResult を受け取り、
 * fflate で ZIP を生成してバイナリレスポンスとして返す。
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildZip } from '@/lib/zip';
import { buildInsertionMap } from '@/lib/insertionMap';
import type { ImageProposal, AnalysisResult } from '@/types';
import type { ScreenshotEntry } from '@/store/sessionStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { screenshots, proposals, analysisResult } = body as {
      screenshots: ScreenshotEntry[];
      proposals: ImageProposal[];
      analysisResult: AnalysisResult;
    };

    if (!screenshots || !proposals || !analysisResult) {
      return NextResponse.json(
        { error: 'screenshots, proposals, analysisResult が必要です' },
        { status: 400 }
      );
    }

    // insertion_map.json を生成
    const insertionMap = buildInsertionMap(proposals, analysisResult);

    // PNG バッファのエントリを構築（Base64 → Buffer 変換）
    const entries = screenshots.map((s) => ({
      filename: s.filename,
      buffer: Buffer.from(s.pngBase64, 'base64'),
    }));

    const zipBuffer = buildZip(entries, insertionMap);

    return new NextResponse(zipBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="blogviz_images.zip"',
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error('[/api/export] エラー:', error);
    return NextResponse.json(
      { error: 'ZIP 生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
