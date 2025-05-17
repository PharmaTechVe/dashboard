import { format } from 'date-fns';

/**
 * Sets the time of a Date object to 12:00 PM to prevent timezone offset issues when sending to backend.
 */
export function fixToNoon(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

/**
 * Parses a date string or Date object from the backend (ISO format) and prevents -1 day shift due to timezone.
 */
export function parseApiDate(date: string | Date): Date {
  if (typeof date === 'string') {
    const [year, month, day] = date.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }
  return new Date(date);
}
/**
 * Converts a date from "dd/MM/yyyy" format to "yyyy-MM-dd". Used for sending birth dates to the backend.
 */
export function convertSlashDateToIso(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Formats a date (string or Date object) into "dd/MM/yyyy" format for display (e.g. in read-only inputs).
 */
export function formatDateSafe(date: string | Date): string {
  try {
    const d = parseApiDate(date);
    return format(d, 'dd/MM/yyyy');
  } catch {
    return typeof date === 'string' ? date : date.toString();
  }
}

/**
 * Formats a date (string or Date object) into "yyyy-MM-dd" format for use in <input type="date" /> fields.
 */
export function formatDateForInput(date: string | Date): string {
  try {
    const d = parseApiDate(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}
