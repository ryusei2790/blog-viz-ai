/**
 * @file lib/ai/types.ts
 * @description AI プロバイダ共通インターフェース
 *
 * Anthropic / OpenAI / Gemini の差異をここで吸収する。
 * analyze.ts / propose.ts / generateHtml.ts はこのインターフェースだけを使う。
 */

export interface AIProvider {
  /**
   * システムプロンプトとユーザーメッセージを送り、テキスト応答を返す
   * @param systemPrompt - モデルへの役割・指示
   * @param userPrompt  - ユーザー入力（記事テキスト / JSON など）
   * @param maxTokens  - 最大出力トークン数
   */
  chat(
    systemPrompt: string,
    userPrompt: string,
    maxTokens?: number
  ): Promise<string>;
}

/** サポートするプロバイダ名 */
export type ProviderName = 'anthropic' | 'openai' | 'gemini';
