/**
 * Zakat Calculator for MENA Region (specifically KSA)
 * Zakat is typically 2.5% of the Zakat Base (net worth/zakatable assets)
 * calculated based on the Hijri year (354 days).
 */

export interface ZakatInputs {
  cashAndEquivalents: number;
  receivables: number; // money owed to the business
  inventory: number; // goods for sale
  investments: number; // short term trading investments
  
  // Deductions
  shortTermLiabilities: number; // debts due within a year
}

export interface ZakatResult {
  zakatBase: number;
  zakatAmount: number;
  isEligible: boolean; // Nisab threshold check
}

// Nisab is the minimum amount of wealth one must have before they are liable to pay Zakat.
// Usually equivalent to 85 grams of gold. (Approx 20,000 SAR for this example)
const NISAB_THRESHOLD_SAR = 20000;
const ZAKAT_RATE = 0.025; // 2.5%

export function calculateZakat(inputs: ZakatInputs): ZakatResult {
  // 1. Calculate Zakatable Assets
  const zakatableAssets = 
    inputs.cashAndEquivalents + 
    inputs.receivables + 
    inputs.inventory + 
    inputs.investments;

  // 2. Calculate Deductible Liabilities
  const deductibleLiabilities = inputs.shortTermLiabilities;

  // 3. Calculate Zakat Base (Net Zakatable Wealth)
  const zakatBase = Math.max(0, zakatableAssets - deductibleLiabilities);

  // 4. Check against Nisab
  const isEligible = zakatBase >= NISAB_THRESHOLD_SAR;

  // 5. Calculate Zakat Amount
  const zakatAmount = isEligible ? zakatBase * ZAKAT_RATE : 0;

  return {
    zakatBase,
    zakatAmount,
    isEligible
  };
}
