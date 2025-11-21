/**
 * Rotation Quarter Utilities
 * Helpers for working with rotation quarters (1-4) within a year
 */

/**
 * Get the current quarter (1-4) based on the current month
 */
export function getCurrentQuarter(): number {
  const month = new Date().getMonth() + 1; // 1-12
  return Math.ceil(month / 3); // 1-4
}

/**
 * Get the default rotation quarter for form creation
 * Defaults to Q-1 (previous quarter), with minimum of 1
 *
 * Logic:
 * - Q1 (Jan-Mar) → Default to Rotation 1
 * - Q2 (Apr-Jun) → Default to Rotation 1
 * - Q3 (Jul-Sep) → Default to Rotation 2
 * - Q4 (Oct-Dec) → Default to Rotation 3
 */
export function getDefaultRotationQuarter(): number {
  const currentQuarter = getCurrentQuarter();
  return Math.max(1, currentQuarter - 1); // Q-1, min 1
}

/**
 * Format a rotation label for display
 * @param year - The rotation year
 * @param quarter - The rotation quarter (1-4)
 * @returns Formatted string like "2025 Q1"
 */
export function formatRotationLabel(year: number, quarter: number): string {
  return `${year} Q${quarter}`;
}

/**
 * Get rotation quarter options for dropdowns
 * Returns array of options with value and label
 */
export function getRotationQuarterOptions(): Array<{ value: number; label: string }> {
  return [
    { value: 1, label: 'Rotation 1 (Q1: Jan-Mar)' },
    { value: 2, label: 'Rotation 2 (Q2: Apr-Jun)' },
    { value: 3, label: 'Rotation 3 (Q3: Jul-Sep)' },
    { value: 4, label: 'Rotation 4 (Q4: Oct-Dec)' },
  ];
}

/**
 * Get short rotation quarter options for compact displays
 */
export function getRotationQuarterOptionsShort(): Array<{ value: number; label: string }> {
  return [
    { value: 1, label: 'Q1' },
    { value: 2, label: 'Q2' },
    { value: 3, label: 'Q3' },
    { value: 4, label: 'Q4' },
  ];
}

/**
 * Validate that a quarter value is valid (1-4)
 */
export function isValidQuarter(quarter: number): boolean {
  return Number.isInteger(quarter) && quarter >= 1 && quarter <= 4;
}
