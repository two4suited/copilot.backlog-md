import { formatInTimeZone } from 'date-fns-tz';

const DEFAULT_TZ = 'UTC';

/**
 * Format an ISO datetime string as a time (e.g. "10:00 AM PDT") in the given IANA timezone.
 */
export function fmtTimeTz(iso: string, timeZone: string = DEFAULT_TZ): string {
  return formatInTimeZone(iso, timeZone, 'hh:mm aa zzz');
}

/**
 * Format an ISO datetime string as a date label (e.g. "Monday, June 15") in the given IANA timezone.
 */
export function fmtDayLabelTz(iso: string, timeZone: string = DEFAULT_TZ): string {
  return formatInTimeZone(iso, timeZone, 'EEEE, MMMM d');
}

/**
 * Return a YYYY-MM-DD day key in the given IANA timezone (used for grouping sessions by day).
 */
export function dayKeyTz(iso: string, timeZone: string = DEFAULT_TZ): string {
  return formatInTimeZone(iso, timeZone, 'yyyy-MM-dd');
}

/**
 * Format a time range string (e.g. "10:00 AM – 11:30 AM PDT") in the given IANA timezone.
 */
export function fmtTimeRangeTz(startIso: string, endIso: string, timeZone: string = DEFAULT_TZ): string {
  const start = formatInTimeZone(startIso, timeZone, 'hh:mm aa');
  const end = formatInTimeZone(endIso, timeZone, 'hh:mm aa zzz');
  return `${start} – ${end}`;
}

/**
 * Format an ISO datetime string as a short month/day label (e.g. "Jun 15") in the given IANA timezone.
 */
export function fmtShortDateTz(iso: string, timeZone: string = DEFAULT_TZ): string {
  return formatInTimeZone(iso, timeZone, 'MMM d');
}
