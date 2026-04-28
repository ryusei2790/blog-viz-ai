/**
 * @file components/TextInputArea.tsx
 * @description ブログ本文テキスト入力エリア（文字数カウント付き）
 *
 * 最大 20,000文字のテキストを受け付ける。
 * 文字数を常時表示し、上限に近づくと警告色に変化する。
 */

'use client';

import { Textarea } from '@/components/ui/textarea';

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MAX_CHARS = 20000;

export function TextInputArea({ value, onChange, disabled }: TextInputAreaProps) {
  const count = value.length;
  const isNearLimit = count > MAX_CHARS * 0.9;
  const isOverLimit = count > MAX_CHARS;

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="ブログ記事の本文をここに貼り付けてください（最大 20,000文字）"
        className="min-h-[300px] resize-y font-mono text-sm leading-relaxed"
        maxLength={MAX_CHARS}
      />
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">
          プレーンテキスト・Markdown どちらでも対応
        </span>
        <span
          className={
            isOverLimit
              ? 'text-destructive font-semibold'
              : isNearLimit
              ? 'text-orange-500'
              : 'text-muted-foreground'
          }
        >
          {count.toLocaleString()} / {MAX_CHARS.toLocaleString()}文字
        </span>
      </div>
    </div>
  );
}
