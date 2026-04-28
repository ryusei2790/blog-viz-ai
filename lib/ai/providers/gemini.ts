/**
 * @file lib/ai/providers/gemini.ts
 * @description Google Gemini アダプタ
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider } from '../types';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY が設定されていません');
    }
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // gemini-1.5-pro は廃止済み。指定がない場合または古いモデル名の場合は gemini-2.0-flash を使用
    const envModel = process.env.GEMINI_MODEL;
    const deprecated = ['gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro'];
    this.model = (!envModel || deprecated.includes(envModel)) ? 'gemini-2.0-flash' : envModel;
  }

  async chat(
    systemPrompt: string,
    userPrompt: string,
    maxTokens = 4096
  ): Promise<string> {
    const genModel = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
      generationConfig: { maxOutputTokens: maxTokens },
    });

    const result = await genModel.generateContent(userPrompt);
    const text = result.response.text();

    if (!text) {
      throw new Error('Gemini: 空のレスポンスが返されました');
    }
    return text.trim();
  }
}
