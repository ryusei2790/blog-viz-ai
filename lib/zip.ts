/**
 * @file lib/zip.ts
 * @description fflate を使った ZIP 生成
 *
 * PNG バッファの配列と InsertionMap JSON を受け取り、
 * blogviz_images.zip のバイナリバッファを返す。
 * fflate は Node.js 環境で動作し、型定義も完備している。
 */

import { zipSync, strToU8 } from 'fflate';
import type { InsertionMap } from '@/types';

export interface ZipEntry {
  /** ファイル名 例: image_01.png */
  filename: string;
  /** PNG バイナリバッファ */
  buffer: Buffer;
}

/**
 * PNG 群と insertion_map.json を ZIP にまとめる
 * @param entries - ファイル名と PNG バッファのペア配列
 * @param insertionMap - 挿入位置マップ
 * @returns ZIP バイナリの Buffer
 */
export function buildZip(
  entries: ZipEntry[],
  insertionMap: InsertionMap
): Buffer {
  // fflate は { [filename: string]: Uint8Array } の形式でファイルを受け取る
  const files: Record<string, Uint8Array> = {};

  for (const entry of entries) {
    files[entry.filename] = new Uint8Array(entry.buffer);
  }

  // insertion_map.json を追加
  files['insertion_map.json'] = strToU8(
    JSON.stringify(insertionMap, null, 2)
  );

  const zipped = zipSync(files, { level: 6 });
  return Buffer.from(zipped);
}
