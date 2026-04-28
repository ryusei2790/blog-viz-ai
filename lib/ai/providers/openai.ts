/**
 * @file lib/ai/providers/openai.ts
 * @description OpenAI (ChatGPT) アダプタ
 */

import OpenAI from 'openai';
import type { AIProvider } from '../types';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY が設定されていません');
    }
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = process.env.OPENAI_MODEL ?? 'gpt-4o';
  }

  async chat(
    systemPrompt: string,
    userPrompt: string,
    maxTokens = 4096
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI: 空のレスポンスが返されました');
    }
    return content.trim();
  }
}
