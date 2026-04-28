/**
 * @file app/analyze/page.tsx
 * @description STEP 2-3：解析中 → 提案レポート表示画面
 *
 * マウント時に /api/analyze → /api/propose を順に呼び出し、
 * 解析結果と提案一覧を Zustand ストアに保存する。
 * ユーザーが不要な提案を削除して確認ボタンを押すと /theme へ遷移する。
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore, useHasHydrated } from '@/store/sessionStore';
import { ProposalList } from '@/components/ProposalList';
import { Button } from '@/components/ui/button';
import type { AnalysisResult, ImageProposal } from '@/types';

type Status = 'analyzing' | 'proposing' | 'ready' | 'error';

export default function AnalyzePage() {
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  const {
    rawText,
    setAnalysisResult,
    proposals,
    setProposals,
    removeProposal,
  } = useSessionStore();

  const [status, setStatus] = useState<Status>('analyzing');
  const [error, setError] = useState('');
  // StrictMode 対策: 2回実行を防ぐ ref
  const ranRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!rawText) {
      router.replace('/');
      return;
    }
    // 既にストアに提案がある場合はAPIをスキップして表示
    if (proposals.length > 0) {
      setStatus('ready');
      return;
    }
    if (ranRef.current) return;
    ranRef.current = true;

    const runAnalysis = async () => {
      try {
        // STEP 2: テキスト解析
        setStatus('analyzing');
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: rawText }),
        });

        if (!analyzeRes.ok) {
          const err = await analyzeRes.json();
          throw new Error(err.error ?? '解析に失敗しました');
        }

        const { analysisResult }: { analysisResult: AnalysisResult } =
          await analyzeRes.json();
        setAnalysisResult(analysisResult);

        // STEP 3: 画像提案生成
        setStatus('proposing');
        const proposeRes = await fetch('/api/propose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisResult }),
        });

        if (!proposeRes.ok) {
          const err = await proposeRes.json();
          throw new Error(err.error ?? '提案生成に失敗しました');
        }

        const { proposals: fetchedProposals }: { proposals: ImageProposal[] } =
          await proposeRes.json();
        setProposals(fetchedProposals);
        setStatus('ready');
      } catch (e) {
        setError(e instanceof Error ? e.message : '不明なエラーが発生しました');
        setStatus('error');
      }
    };

    runAnalysis();
  }, [hasHydrated, rawText, router, setAnalysisResult, setProposals, proposals.length]);

  const handleConfirm = () => {
    router.push('/theme');
  };

  if (status === 'analyzing') {
    return <LoadingScreen message="ブログ記事を解析中..." />;
  }

  if (status === 'proposing') {
    return <LoadingScreen message="画像挿入箇所を提案中..." />;
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="space-y-4 text-center max-w-md">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => router.push('/')}>最初からやり直す</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <ProposalList
          proposals={proposals}
          onRemove={removeProposal}
          onConfirm={handleConfirm}
        />
      </div>
    </main>
  );
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </main>
  );
}
