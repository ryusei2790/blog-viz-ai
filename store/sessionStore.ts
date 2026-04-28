/**
 * @file store/sessionStore.ts
 * @description Zustand セッション状態管理
 *
 * ブログテキスト入力から ZIP ダウンロードまでのステップ間で
 * データを保持する。persist ミドルウェアで sessionStorage に永続化するため、
 * ページリロードでも状態が失われない。
 *
 * hydration パターン:
 *   onRehydrateStorage で _hasHydrated フラグを立て、
 *   各ページで useHasHydrated() を使って hydration 完了を待つ。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import type {
  AnalysisResult,
  ImageProposal,
  ThemeName,
  GeneratedSlide,
} from '@/types';

/** スクリーンショットの最小表現（store 内で保持する形式） */
export interface ScreenshotEntry {
  proposalId: string;
  pngBase64: string;
  filename: string;
}

interface SessionState {
  // ── STEP 1：テキスト入力 ──
  rawText: string;

  // ── STEP 2-3：解析・提案 ──
  analysisResult: AnalysisResult | null;
  /** ユーザーが削除した提案を除いた残りの提案リスト */
  proposals: ImageProposal[];

  // ── STEP 4：テーマ選択 ──
  selectedTheme: ThemeName | null;

  // ── STEP 5-6：生成・スクリーンショット ──
  slides: GeneratedSlide[];
  screenshots: ScreenshotEntry[];

  // ── Actions ──
  setText: (text: string) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setProposals: (proposals: ImageProposal[]) => void;
  removeProposal: (id: string) => void;
  setTheme: (theme: ThemeName) => void;
  addSlide: (slide: GeneratedSlide) => void;
  addScreenshot: (s: ScreenshotEntry) => void;
  reset: () => void;
}

const initialState = {
  rawText: '',
  analysisResult: null,
  proposals: [],
  selectedTheme: null,
  slides: [],
  screenshots: [],
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialState,

      setText: (text) => set({ rawText: text }),
      setAnalysisResult: (result) => set({ analysisResult: result }),
      setProposals: (proposals) => set({ proposals }),
      removeProposal: (id) =>
        set((state) => ({
          proposals: state.proposals.filter((p) => p.id !== id),
        })),
      setTheme: (theme) => set({ selectedTheme: theme }),
      addSlide: (slide) =>
        set((state) => ({ slides: [...state.slides, slide] })),
      addScreenshot: (s) =>
        set((state) => ({ screenshots: [...state.screenshots, s] })),
      reset: () => set(initialState),
    }),
    {
      name: 'blogviz-session',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);

/**
 * Zustand persist の hydration が完了したかどうかを返すカスタムフック。
 * SSR → CSR の初回レンダー差分でリダイレクトが誤発火するのを防ぐ。
 */
export function useHasHydrated(): boolean {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // useEffect は CSR でしか実行されないため、
    // ここに到達した時点で sessionStorage の読み込みは完了している
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}
