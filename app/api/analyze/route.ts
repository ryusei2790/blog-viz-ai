/**
 * @file app/api/analyze/route.ts
 * @description POST /api/analyze — ブログテキスト構造解析 API
 *
 * フロントエンドからテキストを受け取り、Claude に解析させて
 * AnalysisResult を JSON で返す。
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/lib/claude/analyze';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body as { text: string };

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text フィールドが必要です' },
        { status: 400 }
      );
    }

    if (text.length > 20000) {
      return NextResponse.json(
        { error: 'テキストは 20,000 文字以内にしてください' },
        { status: 400 }
      );
    }

    const blogInputId = randomUUID();
    const analysisResult = await analyzeText(text, blogInputId);

    return NextResponse.json({ analysisResult });
  } catch (error) {
    console.error('[/api/analyze] エラー:', error);
    return NextResponse.json(
      { error: '解析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
