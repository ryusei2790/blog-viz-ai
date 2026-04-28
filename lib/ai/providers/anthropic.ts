/**
 * @file lib/ai/providers/anthropic.ts
 * @description Anthropic (Claude) アダプタ
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from '../types';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY が設定されていません');
    }
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
  }

  async chat(
    systemPrompt: string,
    userPrompt: string,
    maxTokens = 4096
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Anthropic: テキスト以外のレスポンスが返されました');
    }
    return content.text.trim();
  }
}
