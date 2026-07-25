export type FeatureTier = 0 | 1 | 2 | 3;

export type Feature = {
  key: string;
  label: string;
  tier: FeatureTier;
  requiredEnvVars: string[];
  description: string;
};

const ALL_FEATURES: Feature[] = [
  {
    key: 'readOnly',
    label: 'Справки и счетоводни данни',
    tier: 0,
    requiredEnvVars: [],
    description: 'Табла, отчети, извлечения от базата данни — без AI',
  },
  {
    key: 'documentSearch',
    label: 'Търсене в документи',
    tier: 0,
    requiredEnvVars: [],
    description: 'Търсене в качени документи (semantic search чрез pgvector)',
  },
  {
    key: 'aiChat',
    label: 'AI Maestro чат',
    tier: 1,
    requiredEnvVars: ['ANTHROPIC_API_KEY'],
    description: 'Чат с AI асистента (Claude 3.5 Sonnet)',
  },
  {
    key: 'aiTools',
    label: 'AI инструменти (HR, Inventory)',
    tier: 1,
    requiredEnvVars: ['ANTHROPIC_API_KEY'],
    description: 'getExpiringIqamas, getPayrollSummary, getComplianceRisks',
  },
  {
    key: 'embeddings',
    label: 'Embeddings за ZATCA и документи',
    tier: 2,
    requiredEnvVars: ['GOOGLE_GENERATIVE_AI_API_KEY'],
    description: 'Векторни embeddings за ZATCA регулации и семантично търсене (text-embedding-004)',
  },
  {
    key: 'billing',
    label: 'Stripe плащания и абонаменти',
    tier: 3,
    requiredEnvVars: ['STRIPE_SECRET_KEY'],
    description: 'Billing, абонаменти, checkout, webhooks',
  },
];

export function getAvailableTiers(): FeatureTier[] {
  const available: FeatureTier[] = [0];
  if (process.env.ANTHROPIC_API_KEY) available.push(1);
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) available.push(2);
  if (process.env.STRIPE_SECRET_KEY) available.push(3);
  return [...new Set(available)].sort();
}

export function getEnabledFeatures(): Feature[] {
  const availableTiers = getAvailableTiers();
  return ALL_FEATURES.filter(f => availableTiers.includes(f.tier));
}

export function isFeatureEnabled(key: string): boolean {
  return getEnabledFeatures().some(f => f.key === key);
}

export function getFeatureStatusTable(): string {
  const lines: string[] = [];
  lines.push('| Feature | Tier | Key needed | Status |');
  lines.push('|---------|------|------------|--------|');
  for (const f of ALL_FEATURES) {
    const available = getAvailableTiers().includes(f.tier);
    const keyLabel = f.requiredEnvVars.length > 0 ? f.requiredEnvVars.join(', ') : '—';
    lines.push(`| ${f.label} | ${f.tier} | ${keyLabel} | ${available ? '✅' : '❌'} |`);
  }
  return lines.join('\n');
}
