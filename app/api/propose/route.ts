/**
 * @file app/api/propose/route.ts
 * @description POST /api/propose — 画像挿入提案生成 API
 *
 * AnalysisResult を受け取り、Claude に画像提案を生成させて
 * ImageProposal[] を JSON で返す。
 */

import { NextRequest, NextResponse } from 'next/server';
import { proposeImages } from '@/lib/claude/propose';
import type { AnalysisResult } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysisResult } = body as { analysisResult: AnalysisResult };

    if (!analysisResult) {
      return NextResponse.json(
        { error: 'analysisResult フィールドが必要です' },
        { status: 400 }
      );
    }

    const proposals = await proposeImages(analysisResult);

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('[/api/propose] エラー:', error);
    return NextResponse.json(
      { error: '提案生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
