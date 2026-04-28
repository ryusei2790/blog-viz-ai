/**
 * @file components/ProposalList.tsx
 * @description 提案カード一覧 + 確認ボタン
 *
 * 提案の総数を表示し、削除後に残った提案で画像生成に進める。
 * 全件削除した場合は確認ボタンを非活性にする。
 */

'use client';

import { ProposalCard } from './ProposalCard';
import { Button } from '@/components/ui/button';
import type { ImageProposal } from '@/types';

interface ProposalListProps {
  proposals: ImageProposal[];
  onRemove: (id: string) => void;
  onConfirm: () => void;
}

export function ProposalList({ proposals, onRemove, onConfirm }: ProposalListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          📊 提案画像数：{proposals.length}枚
        </h2>
        <p className="text-sm text-muted-foreground">
          不要な提案は削除してから確定してください
        </p>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal, index) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            index={index}
            onRemove={onRemove}
          />
        ))}
      </div>

      {proposals.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          提案がすべて削除されました。戻ってテキストを再入力してください。
        </p>
      )}

      <Button
        onClick={onConfirm}
        disabled={proposals.length === 0}
        className="w-full"
        size="lg"
      >
        この内容で画像生成する →
      </Button>
    </div>
  );
}
