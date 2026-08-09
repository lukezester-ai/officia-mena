import { describe, expect, it } from 'vitest';
import { integrationJobTypeSchema, jobPayloadSchemas, retryDelayMs } from '@/lib/integrations/jobs';

describe('integration job safety', () => {
  it('uses bounded exponential backoff', () => {
    expect(retryDelayMs(1)).toBe(30_000); expect(retryDelayMs(2)).toBe(60_000); expect(retryDelayMs(99)).toBe(3_600_000);
  });
  it('allows only approved external job types', () => {
    expect(integrationJobTypeSchema.safeParse('send_email').success).toBe(true);
    expect(integrationJobTypeSchema.safeParse('make_payment').success).toBe(false);
  });
  it('rejects malformed email and ZATCA jobs', () => {
    expect(jobPayloadSchemas.send_email.safeParse({ to: 'bad', subject: 'x', text: 'x' }).success).toBe(false);
    expect(jobPayloadSchemas.submit_zatca.safeParse({ invoiceId: crypto.randomUUID(), mode: 'clearance' }).success).toBe(true);
  });
});
