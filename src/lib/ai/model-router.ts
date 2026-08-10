import { gateway, type LanguageModel } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export type ModelRoute = {
  model: LanguageModel;
  modelName: string;
  providerOptions?: { gateway: { models: string[] } };
  fallbackConfigured: boolean;
  timeoutMs: number;
  maxRetries: number;
  circuitOpen: boolean;
};

export function resolveMaestroModel(options: { preferFallback?: boolean } = {}): ModelRoute {
  const timeoutMs = Math.min(Math.max(Number(process.env.AI_GATEWAY_TIMEOUT_MS || 25_000), 5_000), 28_000);
  const maxRetries = Math.min(Math.max(Number(process.env.AI_GATEWAY_MAX_RETRIES || 2), 0), 3);
  if (process.env.AI_GATEWAY_API_KEY) {
    const primary = process.env.AI_GATEWAY_PRIMARY_MODEL || 'anthropic/claude-sonnet-4.5';
    const fallback = process.env.AI_GATEWAY_FALLBACK_MODEL || 'google/gemini-2.5-flash';
    const selected = options.preferFallback ? fallback : primary;
    const fallbacks = options.preferFallback ? [] : [fallback];
    return { model: gateway(selected), modelName: selected, fallbackConfigured: fallbacks.length > 0,
      providerOptions: fallbacks.length ? { gateway: { models: fallbacks } } : undefined,
      timeoutMs, maxRetries, circuitOpen: Boolean(options.preferFallback) };
  }
  if (process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant')) {
    const name = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';
    return { model: createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(name), modelName: name,
      fallbackConfigured: false, timeoutMs, maxRetries, circuitOpen: false };
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const name = process.env.GOOGLE_MODEL || 'gemini-2.5-flash';
    return { model: createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })(name), modelName: name,
      fallbackConfigured: false, timeoutMs, maxRetries, circuitOpen: false };
  }
  throw new Error('No AI provider configured. Set AI_GATEWAY_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY.');
}
