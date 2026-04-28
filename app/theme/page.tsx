/**
 * @file app/theme/page.tsx
 * @description STEP 4：デザインテーマ選択画面
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Button } from '@/components/ui/button';
import { useSessionStore, useHasHydrated } from '@/store/sessionStore';
import type { ThemeName } from '@/types';

export default function ThemePage() {
  const router = useRouter();
  const { proposals, selectedTheme, setTheme } = useSessionStore();
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    if (hasHydrated && proposals.length === 0) {
      router.replace('/');
    }
  }, [hasHydrated, proposals.length, router]);

  if (!hasHydrated || proposals.length === 0) return null;

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">デザインテーマを選択</h1>
          <p className="text-muted-foreground">
            全 {proposals.length} 枚の画像に同じテーマが適用されます
          </p>
        </div>

        <ThemeSelector
          selected={selectedTheme}
          onSelect={(t: ThemeName) => setTheme(t)}
        />

        <Button
          onClick={() => { if (selectedTheme) router.push('/generate'); }}
          disabled={!selectedTheme}
          className="w-full"
          size="lg"
        >
          画像を生成する →
        </Button>
      </div>
    </main>
  );
}
