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

  // 3. Simple Mock Hijri Check
  // In a real application, we would use a Hijri calendar library (like umalqura or moment-hijri)
  // to compare the current Hijri date with product.expiryDateHijri.
  // For this mock, we assume year 1445 has passed, and 1446+ is valid.
  if (product.expiryDateHijri) {
    const year = parseInt(product.expiryDateHijri.split('-')[0], 10);
    // Assuming current Hijri year is 1446
    if (year < 1446) {
      return {
        isValid: false,
        reason: `Hijri expiry date (${product.expiryDateHijri}) has passed. Product is unfit for sale.`,
        severity: 'BLOCK'
      };
    }
  }

  return { isValid: true };
}
