export type MoneyInput = string | number | null | undefined;
export type JournalLineInput = { accountId: string; description?: string; debit?: MoneyInput; credit?: MoneyInput; entityType?: string; entityId?: string; };
export type CreateJournalEntryInput = { tenantId: string; entryDate?: Date; memo?: string; sourceType?: string; sourceId?: string; currency?: string; status?: 'draft' | 'posted'; createdBy?: string; lines: JournalLineInput[]; };

export function moneyToCents(value: MoneyInput) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const raw = typeof value === 'number' ? value.toFixed(2) : value.trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(raw)) {
    throw new Error(`Invalid money amount: ${raw}`);
  }

  const sign = raw.startsWith('-') ? -1 : 1;
  const unsigned = raw.replace('-', '');
  const [whole, fraction = ''] = unsigned.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));

  if (!Number.isSafeInteger(cents)) {
    throw new Error(`Money amount is too large: ${raw}`);
  }

  return sign * cents;
}

export function centsToMoney(cents: number) {
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / 100);
  const fraction = (absolute % 100).toString().padStart(2, '0');
  return `${sign}${whole}.${fraction}`;
}

export function nextEntryNumber() {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = `${date.getTime()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  return `JE-${stamp}-${suffix}`;
}
