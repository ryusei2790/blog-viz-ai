/**
 * @file components/ProposalCard.tsx
 * @description 画像挿入提案の1件を表示するカード
 *
 * 提案の詳細（挿入位置・表現タイプ・理由・優先度）を表示し、
 * 削除ボタンで不要な提案をリストから除外できる。
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ImageProposal, VisualType } from '@/types';

const VISUAL_TYPE_LABELS: Record<VisualType, string> = {
  flowchart: 'フローチャート',
  comparison: '比較表',
  steps: 'ステップ図',
  concept: '概念図',
  code: 'コード解説図',
};

interface ProposalCardProps {
  proposal: ImageProposal;
  index: number;
  onRemove: (id: string) => void;
}

export function ProposalCard({ proposal, index, onRemove }: ProposalCardProps) {
  const stars = '★'.repeat(proposal.priority) + '☆'.repeat(5 - proposal.priority);

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">
            #{index + 1}｜{proposal.content.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(proposal.id)}
          >
            削除
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {VISUAL_TYPE_LABELS[proposal.visualType]}
          </Badge>
          <Badge variant="outline">
            優先度：{stars}
          </Badge>
        </div>

        <p className="text-muted-foreground leading-relaxed">{proposal.reason}</p>

        {proposal.content.elements.length > 0 && (
          <div>
            <p className="font-medium mb-1">含める要素：</p>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
              {proposal.content.elements.map((el, i) => (
                <li key={i}>{el}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
