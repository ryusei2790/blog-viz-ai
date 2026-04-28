/**
 * @file app/page.tsx
 * @description STEP 1：ブログテキスト入力画面
 *
 * ユーザーがブログ本文を貼り付けてテキストを Zustand ストアに保存し、
 * /analyze ページへ遷移する。文字数バリデーションもここで行う。
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextInputArea } from '@/components/TextInputArea';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/store/sessionStore';

const MAX_CHARS = 20000;

export default function HomePage() {
  const router = useRouter();
  const { rawText, setText, reset } = useSessionStore();
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    if (!rawText.trim()) {
      setError('テキストを入力してください');
      return;
    }

    if (rawText.length > MAX_CHARS) {
      setError(`テキストは ${MAX_CHARS.toLocaleString()} 文字以内にしてください`);
      return;
    }

    // 前回のセッションをリセットしてから次のステップへ
    reset();
    setText(rawText);
    router.push('/analyze');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">BlogViz AI</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            ブログ本文を貼り付けるだけで、AI が解説画像の挿入箇所を提案し、
            <br />
            PNG 画像として自動生成します。
          </p>
        </div>

        {/* 入力エリア */}
        <div className="space-y-4">
          <TextInputArea
            value={rawText}
            onChange={setText}
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!rawText.trim() || rawText.length > MAX_CHARS}
            className="w-full"
            size="lg"
          >
            解析して画像を提案してもらう →
          </Button>
        </div>

        {/* ステップ説明 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm text-muted-foreground">
          {[
            { step: '1', label: 'テキスト入力' },
            { step: '2', label: 'AI 解析・提案' },
            { step: '3', label: 'テーマ選択' },
            { step: '4', label: 'ZIP ダウンロード' },
          ].map(({ step, label }) => (
            <div key={step} className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto">
                {step}
              </div>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
