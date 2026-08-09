import { gateway, type LanguageModel } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export type ModelRoute = { model: LanguageModel; modelName: string; providerOptions?: { gateway: { models: string[] } }; fallbackConfigured: boolean };

export function resolveMaestroModel(): ModelRoute {
  if (process.env.AI_GATEWAY_API_KEY) {
    const primary = process.env.AI_GATEWAY_PRIMARY_MODEL || 'anthropic/claude-sonnet-4.5';
    const fallback = process.env.AI_GATEWAY_FALLBACK_MODEL || 'google/gemini-2.5-flash';
    return { model: gateway(primary), modelName: primary, fallbackConfigured: true, providerOptions: { gateway: { models: [fallback] } } };
  }
  if (process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant')) {
    const name = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';
    return { model: createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(name), modelName: name, fallbackConfigured: false };
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const name = process.env.GOOGLE_MODEL || 'gemini-2.5-flash';
    return { model: createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })(name), modelName: name, fallbackConfigured: false };
  }
  throw new Error('No AI provider configured. Set AI_GATEWAY_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY.');
}
