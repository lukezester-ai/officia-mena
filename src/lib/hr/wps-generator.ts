export interface WPSEmployee {
  nationalIdNumber: string | null;
  bankIban: string | null;
  basicSalary: string;
  housingAllowance: string | null;
  transportAllowance: string | null;
  firstName: string;
  lastName: string;
}

/**
 * Generates a standard SIF (Salary Information File) CSV string.
 * This is based on typical WPS file structures in the GCC / KSA.
 */
export function generateSifCsv(
  employees: WPSEmployee[],
  establishmentId: string,
  month: number,
  year: number
): string {
  const currentDate = new Date();
  const creationDate = currentDate.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
  const creationTime = currentDate.toISOString().split('T')[1].substring(0, 5).replace(':', ''); // HHMM
  const monthStr = month.toString().padStart(2, '0');
  const period = `${year}${monthStr}`; // YYYYMM

  // Header Record
  // Format: "H", Establishment ID, Period, Creation Date, Creation Time, Record Count, Total Amount
  let totalAmount = 0;
  const records: string[] = [];

  for (const emp of employees) {
    const basic = parseFloat(emp.basicSalary) || 0;
    const housing = parseFloat(emp.housingAllowance || '0') || 0;
    const transport = parseFloat(emp.transportAllowance || '0') || 0;
    const otherAllowances = 0;
    const deductions = 0;
    
    const netSalary = basic + housing + transport + otherAllowances - deductions;
    totalAmount += netSalary;

    // Format: "D" (Detail), Employee ID (Iqama), IBAN, Basic, Housing, Other, Deductions, Net, Payment Method
    const record = [
      'D',
      emp.nationalIdNumber || 'UNKNOWN',
      emp.bankIban || 'UNKNOWN',
      basic.toFixed(2),
      housing.toFixed(2),
      (transport + otherAllowances).toFixed(2),
      deductions.toFixed(2),
      netSalary.toFixed(2),
      'Bank Transfer'
    ].join(',');
    
    records.push(record);
  }

  // Header
  const header = [
    'H',
    establishmentId,
    period,
    creationDate,
    creationTime,
    employees.length,
    totalAmount.toFixed(2)
  ].join(',');

  // Combine
  return [header, ...records].join('\r\n');
}
