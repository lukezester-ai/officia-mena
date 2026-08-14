/**
 * Controlled & Hazardous Goods Module (MENA Specific)
 * Handles Volumetric conversions for Petroleum and Security Clearances for Fertilizers.
 */

// 1. PETROLEUM VOLUMETRIC CONVERSION
export interface PetroleumData {
  observedVolume: number; // Liters at current temp
  observedTempC: number;  // Current Temperature in Celsius
  apiGravity: number;     // Standard density measure
  volumeCorrectionFactor: number; // From an approved ASTM/API calculation source
}

/**
 * Very simplified API gravity volumetric correction.
 * Converts hot/cold fuel volume to standard volume at 15°C (59°F).
 * In reality, this uses complex ASTM Table 54B algorithms.
 */
export function convertToStandardVolume15C(data: PetroleumData): number {
  if (!Number.isFinite(data.observedVolume) || data.observedVolume < 0) throw new Error('Observed volume must be a non-negative number.');
  if (!Number.isFinite(data.observedTempC) || !Number.isFinite(data.apiGravity)) throw new Error('Observed temperature and API gravity are required.');
  if (!Number.isFinite(data.volumeCorrectionFactor) || data.volumeCorrectionFactor <= 0 || data.volumeCorrectionFactor > 2) {
    throw new Error('A verified ASTM/API volume correction factor is required.');
  }
  return data.observedVolume * data.volumeCorrectionFactor;
}

// 2. FERTILIZER SECURITY COMPLIANCE
export interface FertilizerData {
  sku: string;
  isFertilizer: boolean;
  mewaRegistration?: string;
  securityClearanceExpiry?: Date;
}

export interface SecurityCheckResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Blocks the sale of dangerous fertilizers (e.g., Ammonium Nitrate) 
 * if the company's Ministry of Interior clearance has expired.
 */
export function checkFertilizerSecurity(product: FertilizerData): SecurityCheckResult {
  if (!product.isFertilizer) {
    return { isValid: true };
  }

  if (!product.securityClearanceExpiry) {
    return { 
      isValid: false, 
      reason: 'MISSING_SECURITY_CLEARANCE: Cannot sell controlled fertilizer without MOI clearance.' 
    };
  }

  const now = new Date();
  if (product.securityClearanceExpiry < now) {
    return {
      isValid: false,
      reason: `EXPIRED_SECURITY_CLEARANCE: MOI clearance expired on ${product.securityClearanceExpiry.toLocaleDateString()}`
    };
  }

  return { isValid: true };
}
