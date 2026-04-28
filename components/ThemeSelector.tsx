/**
 * @file components/ThemeSelector.tsx
 * @description デザインテーマ選択 UI
 *
 * 3つのテーマカードを表示し、クリックで選択する。
 * 選択されたテーマはハイライト表示される。
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { ThemeName } from '@/types';
import { cn } from '@/lib/utils';

interface ThemeOption {
  name: ThemeName;
  label: string;
  description: string;
  /** プレビュー用の背景色 */
  previewBg: string;
  previewAccent: string;
  previewText: string;
}

const THEMES: ThemeOption[] = [
  {
    name: 'tech',
    label: 'Tech',
    description: '青系・モノスペースフォント。技術記事に最適',
    previewBg: '#0f172a',
    previewAccent: '#38bdf8',
    previewText: '#f1f5f9',
  },
  {
    name: 'minimal',
    label: 'Minimal',
    description: '白黒・シンプル。どんな記事にも馴染む',
    previewBg: '#ffffff',
    previewAccent: '#000000',
    previewText: '#0f172a',
  },
  {
    name: 'warm',
    label: 'Warm',
    description: 'オレンジ・丸み。ライフスタイル・ビジネス記事に',
    previewBg: '#fffbf5',
    previewAccent: '#f97316',
    previewText: '#1c1917',
  },
];

interface ThemeSelectorProps {
  selected: ThemeName | null;
  onSelect: (theme: ThemeName) => void;
}

export function ThemeSelector({ selected, onSelect }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {THEMES.map((theme) => (
        <Card
          key={theme.name}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selected === theme.name
              ? 'ring-2 ring-primary shadow-md'
              : 'hover:ring-1 hover:ring-muted-foreground'
          )}
          onClick={() => onSelect(theme.name)}
        >
          {/* カラープレビュー */}
          <div
            className="h-24 rounded-t-lg flex items-center justify-center"
            style={{ background: theme.previewBg }}
          >
            <div className="text-center">
              <div
                className="text-lg font-bold"
                style={{ color: theme.previewAccent }}
              >
                {theme.label}
              </div>
              <div className="text-xs mt-1" style={{ color: theme.previewText }}>
                サンプルテキスト
              </div>
            </div>
          </div>
          <CardContent className="pt-3 pb-4">
            <p className="font-semibold text-sm">{theme.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
