/**
 * @file types/index.ts
 * @description BlogViz AI 全体で使用する型定義
 *
 * データモデル定義書 (docs/data_models.md) に基づく。
 * pngBase64 は store / API 出力仕様に合わせて統一している。
 */

// ─────────────────────────────────────────────
// プリミティブ型
// ─────────────────────────────────────────────

/** 記事のトーン */
export type Tone = 'technical' | 'lifestyle' | 'business' | 'other';

/** セクションのコンテンツタイプ */
export type ContentType = 'steps' | 'concept' | 'comparison' | 'data' | 'case';

/** 画像の表現タイプ */
export type VisualType =
  | 'flowchart'   // フローチャート・処理フロー
  | 'comparison'  // 比較表・対比
  | 'steps'       // 番号付きステップ
  | 'concept'     // 概念図・関係図
  | 'code';       // コード解説図

/** デザインテーマ名 */
export type ThemeName = 'tech' | 'minimal' | 'warm';

// ─────────────────────────────────────────────
// 入力
// ─────────────────────────────────────────────

/**
 * ユーザーが貼り付けたブログ全文
 */
export interface BlogInput {
  id: string;
  rawText: string;
  format: 'plaintext' | 'markdown';
  charCount: number;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// 解析結果
// ─────────────────────────────────────────────

/**
 * AI によるテキスト構造解析の結果
 */
export interface AnalysisResult {
  id: string;
  blogInputId: string;
  theme: string;
  tone: Tone;
  sections: Section[];
  analyzedAt: Date;
}

/**
 * セクション（見出し単位の意味的ブロック）
 */
export interface Section {
  id: string;
  heading: string;
  body: string;
  contentType: ContentType;
  /** 視覚化で理解度が上がる度合い 0〜10 */
  visualScore: number;
  orderIndex: number;
}

// ─────────────────────────────────────────────
// 画像提案
// ─────────────────────────────────────────────

/**
 * AI による画像挿入提案
 */
export interface ImageProposal {
  id: string;
  sectionId: string;
  /** セクション内の挿入位置 */
  insertPosition: 'before' | 'after';
  /** 段落インデックス（0始まり） */
  paragraphIndex: number;
  visualType: VisualType;
  reason: string;
  /** 優先度 1（低）〜 5（高） */
  priority: 1 | 2 | 3 | 4 | 5;
  content: {
    title: string;
    /** 図に含めるべきラベル・要素 */
    elements: string[];
  };
  proposedAt: Date;
}

// ─────────────────────────────────────────────
// HTML スライド・スクリーンショット
// ─────────────────────────────────────────────

/**
 * AI が生成した HTML スライド
 */
export interface GeneratedSlide {
  id: string;
  proposalId: string;
  html: string;
  generatedAt: Date;
}

/**
 * playwright-core（サーバー上の Chromium）で撮影した PNG
 * Note: pngBase64 は store / API 出力に合わせて統一（data_models.md の pngDataBase64 から変更）
 */
export interface Screenshot {
  id: string;
  proposalId: string;
  /** 出力ファイル名 例: image_01.png */
  filename: string;
  pngBase64: string;
  width: number;
  height: number;
  capturedAt: Date;
}

// ─────────────────────────────────────────────
// 出力バンドル
// ─────────────────────────────────────────────

/**
 * ZIP ダウンロード用バンドル（PNG群 + insertion_map.json のみ）
 */
export interface ExportBundle {
  id: string;
  analysisResultId: string;
  screenshots: Screenshot[];
  insertionMap: InsertionMap;
  exportedAt: Date;
}

/**
 * 挿入位置マップ（JSON 出力用）
 * ユーザーがブログエディタで画像を挿入する際のガイドになる
 */
export interface InsertionMap {
  version: '1.0';
  items: InsertionMapItem[];
}

export interface InsertionMapItem {
  imageFilename: string;
  sectionHeading: string;
  insertPosition: 'before' | 'after';
  paragraphIndex: number;
  visualType: VisualType;
  priority: number;
}

// ─────────────────────────────────────────────
// API レスポンス型
// ─────────────────────────────────────────────

/** /api/analyze のレスポンス */
export interface AnalyzeResponse {
  analysisResult: AnalysisResult;
}

/** /api/propose のレスポンス */
export interface ProposeResponse {
  proposals: ImageProposal[];
}

/** /api/generate-html の1件分レスポンス */
export interface GenerateHtmlResponseItem {
  proposalId: string;
  filename: string;
  pngBase64: string;
}

/** /api/generate-html のレスポンス */
export interface GenerateHtmlResponse {
  items: GenerateHtmlResponseItem[];
}
