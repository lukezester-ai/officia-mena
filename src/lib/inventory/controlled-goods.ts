/**
 * Controlled & Hazardous Goods Module (MENA Specific)
 * Handles Volumetric conversions for Petroleum and Security Clearances for Fertilizers.
 */

// 1. PETROLEUM VOLUMETRIC CONVERSION
export interface PetroleumData {
  observedVolume: number; // Liters at current temp
  observedTempC: number;  // Current Temperature in Celsius
  apiGravity: number;     // Standard density measure
}

/**
 * Very simplified API gravity volumetric correction.
 * Converts hot/cold fuel volume to standard volume at 15°C (59°F).
 * In reality, this uses complex ASTM Table 54B algorithms.
 */
export function convertToStandardVolume15C(data: PetroleumData): number {
  // Simplified thermal expansion coefficient (VCF - Volume Correction Factor)
  // E.g., Diesel expands by ~0.00084 per degree C above 15.
  const STANDARD_TEMP_C = 15;
  const tempDiff = data.observedTempC - STANDARD_TEMP_C;
  
  // Fake coefficient based on API gravity (just for demo purposes)
  const coefficient = (data.apiGravity / 1000) * 0.02; 
  
  const vcf = 1 - (tempDiff * coefficient);
  return data.observedVolume * vcf;
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
