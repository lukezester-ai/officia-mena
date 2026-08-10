/**
 * Halal Compliance Checker (MENA Specific)
 * 
 * Verifies if a product is legally allowed to be sold based on its 
 * Halal certification status and Hijri expiry dates.
 */

export interface HalalProductData {
  sku: string;
  isHalalCertified: boolean;
  halalExpiryDate?: Date; // Gregorian
  expiryDateHijri?: string; // Format: "1446-09-01" (YYYY-MM-DD)
}

export interface HalalCheckResult {
  isValid: boolean;
  reason?: string;
  severity?: 'WARNING' | 'BLOCK';
}

/**
 * Checks if a product can be sold legally.
 * In many GCC countries, selling expired Halal products is a severe offense.
 */
export function checkHalalComplianceForSale(product: HalalProductData): HalalCheckResult {
  // 1. If it doesn't require Halal certification, it's valid to sell.
  if (!product.isHalalCertified) {
    return { isValid: true };
  }

  // 2. Check Gregorian Expiry Date if it exists
  const now = new Date();
  if (product.halalExpiryDate && product.halalExpiryDate < now) {
    return {
      isValid: false,
      reason: `Halal certificate expired on ${product.halalExpiryDate.toLocaleDateString()}`,
      severity: 'BLOCK'
    };
  }

  if (product.expiryDateHijri) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(product.expiryDateHijri)) {
      return { isValid: false, reason: 'Invalid Hijri expiry date format.', severity: 'BLOCK' };
    }
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Riyadh'
    }).formatToParts(now);
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || '00';
    const currentHijriDate = `${value('year')}-${value('month')}-${value('day')}`;
    if (product.expiryDateHijri < currentHijriDate) {
      return {
        isValid: false,
        reason: `Hijri expiry date (${product.expiryDateHijri}) has passed. Product is unfit for sale.`,
        severity: 'BLOCK'
      };
    }
  }

  return { isValid: true };
}
