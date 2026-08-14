import { describe, expect, it } from 'vitest';
import { convertToStandardVolume15C } from './controlled-goods';

describe('controlled goods volume conversion', () => {
  it('uses an externally verified correction factor without estimating it', () => {
    expect(convertToStandardVolume15C({ observedVolume: 1000, observedTempC: 30, apiGravity: 35, volumeCorrectionFactor: 0.987 }))
      .toBeCloseTo(987);
  });

  it('rejects invalid regulatory calculation inputs', () => {
    expect(() => convertToStandardVolume15C({ observedVolume: 1000, observedTempC: 30, apiGravity: 35,
      volumeCorrectionFactor: Number.NaN })).toThrow('verified ASTM/API');
  });
});
