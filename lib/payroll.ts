export function calculatePayroll(employee: { salary?: string | number }, presentDays: number, workingDays: number) {
  const salary = parseFloat(String(employee.salary || '0'))
  const perDay = salary / workingDays
  const earnedSalary = perDay * presentDays

  // 50% Basic, 20% HRA, 10% DA, 5% TA, 15% Other
  const basic = earnedSalary * 0.50
  const hra = earnedSalary * 0.20
  const da = earnedSalary * 0.10
  const ta = earnedSalary * 0.05
  const other = earnedSalary * 0.15
  const gross = basic + hra + da + ta + other

  // Deductions
  const pf = basic * 0.12          // 12% of basic
  const esi = gross < 21000 ? gross * 0.0175 : 0 // 1.75% of gross if under 21k
  const pt = 200                   // Professional Tax (state-specific)
  const tds = gross > 50000 ? gross * 0.10 : 0  // TDS if applicable

  const totalDeductions = pf + esi + pt + tds
  const netSalary = gross - totalDeductions

  return {
    basic: Number(basic.toFixed(2)),
    hra: Number(hra.toFixed(2)),
    da: Number(da.toFixed(2)),
    ta: Number(ta.toFixed(2)),
    other: Number(other.toFixed(2)),
    gross: Number(gross.toFixed(2)),
    pf: Number(pf.toFixed(2)),
    esi: Number(esi.toFixed(2)),
    pt: Number(pt.toFixed(2)),
    tds: Number(tds.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netSalary: Number(netSalary.toFixed(2)),
    earnedSalary: Number(earnedSalary.toFixed(2))
  }
}
