/**
 * @file lib/insertionMap.ts
 * @description insertion_map.json の生成
 *
 * ImageProposal[] と AnalysisResult から InsertionMap を構築する。
 * ユーザーがブログエディタで画像を挿入する際のガイドとなる JSON。
 */

import type { ImageProposal, AnalysisResult, InsertionMap } from '@/types';

/**
 * 提案リストと解析結果から InsertionMap を生成する
 * @param proposals - 確定した ImageProposal の配列
 * @param analysisResult - セクション見出しを取得するための解析結果
 */
export function buildInsertionMap(
  proposals: ImageProposal[],
  analysisResult: AnalysisResult
): InsertionMap {
  // sectionId → heading の逆引きマップを作成
  const sectionMap = new Map(
    analysisResult.sections.map((s) => [s.id, s.heading])
  );

  const items = proposals.map((p, index) => ({
    imageFilename: `image_${String(index + 1).padStart(2, '0')}.png`,
    sectionHeading: sectionMap.get(p.sectionId) ?? '',
    insertPosition: p.insertPosition,
    paragraphIndex: p.paragraphIndex,
    visualType: p.visualType,
    priority: p.priority,
  }));

  return {
    version: '1.0',
    items,
  };
}
