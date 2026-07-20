/**
 * EOSB (End of Service Benefits) Calculator
 * 
 * Based on Saudi Labor Law (Article 84).
 * For the first 5 years of service, the worker gets half a month's wage for each year.
 * For the subsequent years, the worker gets a full month's wage for each year.
 * 
 * Note: Resignation vs Termination rules apply, but for this basic calculator
 * we assume standard EOSB payout upon termination/end of contract.
 */

export function calculateEOSB(basicSalary: number, yearsOfService: number): number {
  if (yearsOfService <= 0) return 0;

  let totalEosb = 0;

  if (yearsOfService <= 5) {
    // Half a month salary for each year
    totalEosb = yearsOfService * (basicSalary / 2);
  } else {
    // 5 years at half salary
    const firstFiveYears = 5 * (basicSalary / 2);
    // Remaining years at full salary
    const remainingYears = (yearsOfService - 5) * basicSalary;
    
    totalEosb = firstFiveYears + remainingYears;
  }

  return totalEosb;
}

export function formatSaudiRiyal(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SAR';
}
