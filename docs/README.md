# BlogViz AI — ドキュメント一覧

**プロジェクト：** BlogViz AI（ブログ解説画像自動生成・挿入提案ツール）
**作成日：** 2026-03-20
**更新日：** 2026-03-23

---

## ドキュメント構成

| ファイル | 内容 | ステータス |
|----------|------|-----------|
| [requirements.md](./requirements.md) | 要件定義書（機能要件・非機能要件・MVP スコープ） | **確定** |
| [project_plan.md](./project_plan.md) | プロジェクト計画書（フェーズ別タスク・リスク管理） | **確定** |
| [architecture.md](./architecture.md) | アーキテクチャ設計書（ディレクトリ構成・依存関係・プロンプト設計） | **確定** |
| [ui_wireframe.md](./ui_wireframe.md) | UI ワイヤーフレーム（画面遷移・各画面レイアウト） | **確定** |
| [system_flow.md](./system_flow.md) | システムフロー設計書（処理ブロック定義・Mermaid フロー図） | 確定 |
| [data_models.md](./data_models.md) | データモデル定義書（ER 図・TypeScript 型定義） | 確定 |
| [open_questions.md](./open_questions.md) | 未確定事項・確認リスト（Q1〜Q4） | ✅ 全項目確定 |

---

## 現在のフェーズ

```
Phase 0：問題定義     ✅ 完了
Phase 1：技術スタック選定  ✅ 完了
Phase 2：設計         ✅ 完了
Phase 3：実装         ⏳ 未着手（次のフェーズ）
Phase 4：テスト・調整  ⏳ 未着手
Phase 5：リリース      ⏳ 未着手
```

---

## 確定した技術スタック

| カテゴリ | 採用技術 |
|----------|---------|
| フロントエンド | Next.js 15（App Router） |
| UI | shadcn/ui + Tailwind CSS v4 |
| AI エンジン | Claude API（claude-sonnet-4-6）+ Anthropic SDK |
| スクリーンショット | playwright-core + システム Chromium |
| ZIP 生成 | fflate |
| デプロイ | Railway（Docker コンテナ） |
| コンテナ | Docker（Chromium + 日本語フォント込み） |

---

## 次のステップ

**Phase 3（実装）** に進む。実装順序は [project_plan.md](./project_plan.md) を参照。
