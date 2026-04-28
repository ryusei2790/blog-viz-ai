# BlogViz AI — システムフロー設計書

**バージョン：** 1.1.0
**作成日：** 2026-03-20
**更新日：** 2026-03-23

---

## 全体フロー図

```mermaid
flowchart TD
    A[ユーザー\nブログ全文テキスト入力] --> B[STEP 2\nAI：テキスト構造解析]

    B --> B1[セクション分割\nH1〜H3 / 意味的まとまり]
    B --> B2[内容タイプ判定\n手順系・概念・比較・数値・事例]
    B --> B3[記事テーマ把握\n技術系・ライフスタイル・ビジネス等]
    B --> B4[視覚化優先度スコア\n0〜10でスコアリング]

    B1 & B2 & B3 & B4 --> C[STEP 3\nAI：画像提案レポート生成]

    C --> C1[総提案枚数]
    C --> C2[挿入位置\nセクション名・段落番号]
    C --> C3[表現タイプ\nフロー・比較・ステップ・概念図等]
    C --> C4[優先度スコア\n★1〜5]

    C1 & C2 & C3 & C4 --> D{ユーザー確認ステップ\n提案カード 承認 / 削除}

    D -- 確定 --> D2[テーマ選択\nTech / Minimal / Warm]
    D -- 削除して再確認 --> D

    D2 --> E[STEP 5\nAI：HTMLスライド生成\n選択テーマ適用]

    E --> E1[1提案 = 1 HTMLファイル\n800×450px]
    E1 --> F[STEP 6\nplaywright-core\nChromium on Railway]

    F --> F1[PNG出力\n2x Retina\n日本語フォント適用]

    F1 --> G[STEP 7\n出力]
    G --> G1[画像ファイル群\nimage_01.png 〜]
    G --> G2[挿入位置マップ\ninsertion_map.json]
    G1 & G2 --> H[ZIPダウンロード]
```

---

## 処理ブロック定義

### ブロック 1：テキスト入力

| 項目 | 内容 |
|------|------|
| 入力データ | プレーンテキスト / Markdown（最大 20,000文字） |
| 処理内容 | 入力値バリデーション（文字数チェック・空白チェック） |
| 出力データ | バリデーション済みテキスト文字列 |
| 次のブロック | AI テキスト構造解析 |

### ブロック 2：AI テキスト構造解析

| 項目 | 内容 |
|------|------|
| 入力データ | ブログ全文テキスト |
| 処理内容 | Claude API へプロンプト送信 → セクション分割・タイプ判定・スコアリング |
| 出力データ | `AnalysisResult`（セクション配列・タイプ・スコア） |
| 次のブロック | 画像提案レポート生成 |

```typescript
interface Section {
  id: string;
  heading: string;
  body: string;
  contentType: 'steps' | 'concept' | 'comparison' | 'data' | 'case';
  visualScore: number; // 0〜10
}

interface AnalysisResult {
  theme: string;
  tone: 'technical' | 'lifestyle' | 'business' | 'other';
  sections: Section[];
}
```

### ブロック 3：画像提案レポート生成

| 項目 | 内容 |
|------|------|
| 入力データ | `AnalysisResult` |
| 処理内容 | Claude API へプロンプト送信 → 挿入位置・表現タイプ・理由を生成 |
| 出力データ | `ImageProposal[]` |
| 次のブロック | ユーザー確認（または直接 HTML 生成） |

```typescript
interface ImageProposal {
  id: string;
  sectionId: string;
  insertPosition: 'before' | 'after';
  paragraphIndex: number;
  visualType: 'flowchart' | 'comparison' | 'steps' | 'concept' | 'code';
  reason: string;
  priority: 1 | 2 | 3 | 4 | 5;
  content: {
    title: string;
    elements: string[]; // 図に含めるべき要素・ラベル
  };
}
```

### ブロック 4：テーマ選択（ユーザー操作）

| 項目 | 内容 |
|------|------|
| 入力データ | ユーザーのクリック操作 |
| 処理内容 | Tech / Minimal / Warm の3テーマから1つを選択 |
| 出力データ | `ThemeName: 'tech' \| 'minimal' \| 'warm'` |
| 次のブロック | HTML スライド生成 |

### ブロック 5：HTML スライド生成

| 項目 | 内容 |
|------|------|
| 入力データ | `ImageProposal[]` + `ThemeName` |
| 処理内容 | Claude API へプロンプト送信 → 各提案に対応するHTMLを生成（テーマ適用済み） |
| 出力データ | `GeneratedSlide[]`（`{ id: string; html: string }[]`） |
| 次のブロック | playwright-core スクリーンショット |

### ブロック 6：playwright-core スクリーンショット

| 項目 | 内容 |
|------|------|
| 入力データ | `GeneratedSlide[]`（HTML 文字列配列） |
| 処理内容 | Railway の Docker コンテナ上で Chromium を起動 → HTML を開く → スクリーンショット取得 → ブラウザをクローズ |
| 出力データ | PNG Buffer 配列（`proposalId` で紐付け） |
| 次のブロック | 出力・ZIP 生成 |

### ブロック 7：出力・ZIP 生成

| 項目 | 内容 |
|------|------|
| 入力データ | PNG Buffer 配列 + `ImageProposal[]` |
| 処理内容 | fflate で ZIP 生成（画像群 + `insertion_map.json`） |
| 出力データ | ZIP ファイル（ダウンロード） |
| 次のブロック | ユーザーへ返却（完了） |

---

## エラーハンドリング方針

| エラーケース | 対応 |
|-------------|------|
| テキスト 20,000文字超過 | 入力時点でバリデーションエラーを表示 |
| AI API タイムアウト（10秒超過） | リトライ 1回 → 失敗時エラーメッセージ表示 |
| HTML スライド生成失敗 | 該当スライドをスキップし、他の処理を継続 |
| Playwright スクリーンショット失敗 | HTML ファイルをそのまま出力に含める |
| 日本語フォント未適用 | Google Fonts CDN → ローカルフォントのフォールバック順 |
