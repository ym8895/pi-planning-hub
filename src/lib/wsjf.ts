// WSJF — SAFe Weighted Shortest Job First prioritization.
// CoD (Cost of Delay) = BusinessValue + TimeCriticality + RiskReduction
// WSJF = CoD / JobSize

export interface WsjfInput {
  businessValue: number; // 1-10
  timeCriticality: number; // 1-10
  riskReduction: number; // 1-10
  jobSize: number; // 1-10 (higher = bigger)
}

export function computeWsjf(input: WsjfInput): number {
  const size = input.jobSize > 0 ? input.jobSize : 1;
  const cod = input.businessValue + input.timeCriticality + input.riskReduction;
  return Math.round((cod / size) * 100) / 100;
}

export function computeCostOfDelay(input: WsjfInput): number {
  return input.businessValue + input.timeCriticality + input.riskReduction;
}

export function rankByWsjf<
  T extends { id: string; businessValue: number; timeCriticality: number; riskReduction: number; jobSize: number },
>(items: T[]): (T & { wsjf: number })[] {
  return items
    .map((item) => ({ ...item, wsjf: computeWsjf(item) }))
    .sort((a, b) => b.wsjf - a.wsjf);
}
