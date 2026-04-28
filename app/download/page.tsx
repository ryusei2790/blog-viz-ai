/**
 * @file app/download/page.tsx
 * @description STEP 7：ZIP ダウンロード完了画面
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore, useHasHydrated } from '@/store/sessionStore';
import { Button } from '@/components/ui/button';

export default function DownloadPage() {
  const router = useRouter();
  const { screenshots, proposals, analysisResult, reset } = useSessionStore();
  const hasHydrated = useHasHydrated();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasHydrated && !screenshots.length) {
      router.replace('/');
    }
  }, [hasHydrated, screenshots.length, router]);

  if (!hasHydrated || !screenshots.length) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenshots, proposals, analysisResult }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'ZIP 生成に失敗しました');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blogviz_images.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : '不明なエラーが発生しました');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">✅ 画像生成完了</h1>
          <p className="text-muted-foreground">
            {screenshots.length} 枚の画像と挿入位置マップを ZIP でダウンロードできます
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {screenshots.map((s) => (
            <div key={s.proposalId} className="space-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${s.pngBase64}`}
                alt={s.filename}
                className="w-full rounded-lg border aspect-video object-cover shadow-sm"
              />
              <p className="text-xs text-center text-muted-foreground">{s.filename}</p>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="space-y-3">
          <Button onClick={handleDownload} disabled={downloading} className="w-full" size="lg">
            {downloading ? 'ZIPを準備中...' : '📦 blogviz_images.zip をダウンロード'}
          </Button>
          <Button variant="outline" onClick={() => { reset(); router.push('/'); }} className="w-full">
            別の記事で使う（最初に戻る）
          </Button>
        </div>
      </div>
    </main>
  );
}
