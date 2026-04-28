/**
 * @file lib/ai/factory.ts
 * @description AIProvider のファクトリ
 *
 * 環境変数 AI_PROVIDER の値に応じて適切なアダプタを返す。
 * デフォルトは anthropic。
 *
 * 使用例：
 *   const ai = getAIProvider();
 *   const text = await ai.chat(systemPrompt, userPrompt);
 */

import type { AIProvider, ProviderName } from './types';
import { AnthropicProvider } from './providers/anthropic';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';

export function getAIProvider(): AIProvider {
  const name = (process.env.AI_PROVIDER ?? 'anthropic') as ProviderName;

  switch (name) {
    case 'anthropic':
      return new AnthropicProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'gemini':
      return new GeminiProvider();
    default:
      throw new Error(
        `未対応の AI_PROVIDER: "${name}". anthropic / openai / gemini のいずれかを指定してください`
      );
  }
}
