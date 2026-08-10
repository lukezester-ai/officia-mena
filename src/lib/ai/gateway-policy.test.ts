import { describe, expect, it } from 'vitest';
import { classifyAiError } from './gateway-policy';

describe('classifyAiError', () => {
  it('classifies operational provider failures', () => {
    expect(classifyAiError(new Error('Request timeout'))).toBe('MODEL_TIMEOUT');
    expect(classifyAiError(new Error('HTTP 429 rate limit'))).toBe('MODEL_RATE_LIMIT');
    expect(classifyAiError(new Error('401 authentication failed'))).toBe('MODEL_AUTH_ERROR');
    expect(classifyAiError(new Error('503 provider overloaded'))).toBe('MODEL_UNAVAILABLE');
  });

  it('uses a stable generic code without exposing provider details', () => {
    expect(classifyAiError(new Error('unexpected transport failure'))).toBe('MODEL_STREAM_ERROR');
  });
});
