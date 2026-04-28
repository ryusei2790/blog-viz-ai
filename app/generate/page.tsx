/**
 * @file app/generate/page.tsx
 * @description STEP 5-6：HTML生成 + スクリーンショット + プレビュー画面
 *
 * マウント時に /api/generate-html を呼び出す。
 * 全提案の HTML スライドを生成 → Playwright で PNG 化し、
 * ストアにスクリーンショットを保存する。完了後 /download へ遷移する。
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/sessionStore';
import { GenerationProgress } from '@/components/GenerationProgress';
import { Button } from '@/components/ui/button';
import type { GenerateHtmlResponseItem } from '@/types';

type Status = 'generating' | 'done' | 'error';

export default function GeneratePage() {
  const router = useRouter();
  const { proposals, selectedTheme, screenshots, addScreenshot } = useSessionStore();

  const [status, setStatus] = useState<Status>('generating');
  const [completed, setCompleted] = useState(0);
  const [error, setError] = useState('');
  const ranRef = useRef(false);

  useEffect(() => {
    if (!proposals.length || !selectedTheme) {
      router.replace('/');
      return;
    }
    if (ranRef.current) return;
    ranRef.current = true;

    const runGeneration = async () => {
      try {
        const res = await fetch('/api/generate-html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proposals, theme: selectedTheme }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? '画像生成に失敗しました');
        }

        const { items }: { items: GenerateHtmlResponseItem[] } = await res.json();

        for (const item of items) {
          addScreenshot({
            proposalId: item.proposalId,
            pngBase64: item.pngBase64,
            filename: item.filename,
          });
          setCompleted((c) => c + 1);
        }

        setStatus('done');
        router.push('/download');
      } catch (e) {
        setError(e instanceof Error ? e.message : '不明なエラーが発生しました');
        setStatus('error');
      }
    };

    runGeneration();
  }, [proposals, selectedTheme, router, addScreenshot]);

  if (status === 'error') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="space-y-4 text-center max-w-md">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => router.push('/theme')}>テーマ選択に戻る</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold">画像を生成しています</h1>
          <p className="text-sm text-muted-foreground">
            Claude が HTML スライドを作成し、スクリーンショットに変換しています
          </p>
        </div>

        <GenerationProgress
          total={proposals.length}
          completed={completed}
        />

        {/* 生成済みプレビュー（小サムネイル） */}
        {screenshots.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {screenshots.map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.proposalId}
                src={`data:image/png;base64,${s.pngBase64}`}
                alt={s.filename}
                className="w-full rounded border aspect-video object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
