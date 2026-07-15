// Capacity engine — pure functions for SAFe team capacity planning.
// All math is here so it can be unit-tested independently of the DB.

export const WORK_HOURS_PER_DAY = 8;
export const WORK_DAYS_PER_WEEK = 5;
/** Threshold above which a team is flagged overloaded. */
export const OVERLOAD_THRESHOLD = 1.0; // 100% utilization

export interface CapacityInput {
  /** Number of productive members on the team this iteration. */
  teamSize: number;
  /** Iteration length in calendar days (e.g. 14 for a fortnight). */
  iterationDays: number;
  /** Sum of holiday days that fall inside the iteration window. */
  holidayDays: number;
  /** Sum of leave (vacation/sick) days across all members this iteration. */
  leaveDays: number;
  /** Focus factor: share of remaining time actually spent producing. 0-1. */
  focusFactor: number;
  /** Share of time allocated to support/maintenance. 0-1. */
  supportPercent: number;
  /** Share of time allocated to meetings/ceremonies. 0-1. */
  meetingsPercent: number;
  /** Average story-point weight, used to convert points → hours. */
  hoursPerPoint: number;
}

export interface CapacityResult {
  /** Gross person-hours available before deductions (teamSize × workDays × 8h). */
  grossHours: number;
  /** Hours lost to holidays + leave. */
  unavailableHours: number;
  /** Net hours available for *all* work (after leave/holidays). */
  netHours: number;
  /** Hours already reserved for support/maintenance. */
  supportHours: number;
  /** Hours already reserved for meetings/ceremonies. */
  meetingHours: number;
  /** Hours truly available for planned story work. */
  availableHours: number;
  /** Hours implied by the stories currently assigned. */
  plannedHours: number;
  /** plannedHours converted back to points (for display). */
  availablePoints: number;
  /** plannedHours - availableHours (negative = spare capacity). */
  remainingHours: number;
  /** plannedHours / availableHours (0 if no available hours). */
  utilization: number;
  /** True when utilization exceeds the overload threshold. */
  overloaded: boolean;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/**
 * Compute the working (Mon–Fri) days that fall inside an iteration window,
 * excluding holidays. Used to derive `iterationDays`/`holidayDays` inputs.
 */
export function workingDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const stop = new Date(end);
  stop.setHours(0, 0, 0, 0);
  while (cursor <= stop) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/**
 * Core capacity calculation. Pure — no side effects, deterministic.
 */
export function computeCapacity(
  input: CapacityInput,
  plannedPoints: number,
): CapacityResult {
  const safe = {
    teamSize: Math.max(0, input.teamSize),
    iterationDays: Math.max(0, input.iterationDays),
    holidayDays: Math.max(0, input.holidayDays),
    leaveDays: Math.max(0, input.leaveDays),
    focusFactor: clamp(input.focusFactor, 0, 1),
    supportPercent: clamp(input.supportPercent, 0, 1),
    meetingsPercent: clamp(input.meetingsPercent, 0, 1),
    hoursPerPoint: input.hoursPerPoint > 0 ? input.hoursPerPoint : 8,
  };

  const grossHours = safe.teamSize * safe.iterationDays * WORK_HOURS_PER_DAY;
  const unavailableHours =
    (safe.holidayDays + safe.leaveDays) * WORK_HOURS_PER_DAY;
  const netHours = Math.max(0, grossHours - unavailableHours);

  const supportHours = netHours * safe.supportPercent;
  const meetingHours = netHours * safe.meetingsPercent;
  const productiveHours = Math.max(
    0,
    netHours - supportHours - meetingHours,
  );
  const availableHours = productiveHours * safe.focusFactor;

  const plannedHours = Math.max(0, plannedPoints) * safe.hoursPerPoint;
  const availablePoints =
    safe.hoursPerPoint > 0 ? availableHours / safe.hoursPerPoint : 0;
  const remainingHours = availableHours - plannedHours;
  const utilization = availableHours > 0 ? plannedHours / availableHours : 0;
  const overloaded = utilization > OVERLOAD_THRESHOLD;

  return {
    grossHours: round1(grossHours),
    unavailableHours: round1(unavailableHours),
    netHours: round1(netHours),
    supportHours: round1(supportHours),
    meetingHours: round1(meetingHours),
    availableHours: round1(availableHours),
    plannedHours: round1(plannedHours),
    availablePoints: round1(availablePoints),
    remainingHours: round1(remainingHours),
    utilization: round3(utilization),
    overloaded,
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round3 = (n: number) => Math.round(n * 1000) / 1000;
