/**
 * @file components/GenerationProgress.tsx
 * @description 画像生成中のプログレスバー
 *
 * 全提案数と完了済み枚数を受け取り、進捗を可視化する。
 */

'use client';

import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  total: number;
  completed: number;
}

export function GenerationProgress({ total, completed }: GenerationProgressProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">画像を生成中...</span>
        <span className="font-medium">
          {completed} / {total} 枚 ({percentage}%)
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
