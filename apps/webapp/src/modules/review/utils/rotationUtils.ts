/**
 * Rotation Number Utilities
 * Helpers for working with rotation numbers (1-4) within a year
 */

/**
 * Estimate the current rotation number (1-4) from the calendar month.
 * Used only as a default when auto-selecting or creating forms.
 */
function getCurrentRotationNumberFromCalendar(): number {
  const month = new Date().getMonth() + 1; // 1-12
  return Math.ceil(month / 3); // 1-4
}

/**
 * Get the default rotation number for form creation.
 * Defaults to one less than the calendar-based estimate, with minimum of 1.
 *
 * Logic:
 * - Jan-Mar → Default to Rotation 1
 * - Apr-Jun → Default to Rotation 1
 * - Jul-Sep → Default to Rotation 2
 * - Oct-Dec → Default to Rotation 3
 */
export function getDefaultRotationNumber(): number {
  const calendarEstimate = getCurrentRotationNumberFromCalendar();
  return Math.max(1, calendarEstimate - 1);
}

/**
 * Format a rotation label for display
 * @param year - The rotation year
 * @param rotationNumber - The rotation number (1-4)
 * @returns Formatted string like "2025 Rotation 1"
 */
export function formatRotationLabel(year: number, rotationNumber: number): string {
  return `${year} Rotation ${rotationNumber}`;
}

export function getReviewFormRotationNumber(form: { rotationNumber: number }): number {
  return form.rotationNumber;
}

/**
 * Get rotation number options for dropdowns
 * Returns array of options with value and label
 */
export function getRotationNumberOptions(): { value: number; label: string }[] {
  return [
    { value: 1, label: 'Rotation 1' },
    { value: 2, label: 'Rotation 2' },
    { value: 3, label: 'Rotation 3' },
    { value: 4, label: 'Rotation 4' },
  ];
}

/**
 * Get short rotation number options for compact displays
 */
export function getRotationNumberOptionsShort(): { value: number; label: string }[] {
  return [
    { value: 1, label: 'Rotation 1' },
    { value: 2, label: 'Rotation 2' },
    { value: 3, label: 'Rotation 3' },
    { value: 4, label: 'Rotation 4' },
  ];
}
