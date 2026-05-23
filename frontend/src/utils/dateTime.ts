function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatDateForApi(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatTimeForApi(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function normalizeTime(time?: string) {
  if (!time) return '';

  const trimmed = time.trim();
  const twentyFourHour = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (twentyFourHour) {
    return `${pad(Number(twentyFourHour[1]))}:${twentyFourHour[2]}`;
  }

  const twelveHour = trimmed.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!twelveHour) return '';

  let hour = Number(twelveHour[1]);
  const meridiem = twelveHour[3].toUpperCase();

  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  return `${pad(hour)}:${twelveHour[2]}`;
}

export function parseApiDate(date?: string) {
  if (!date) return null;
  const value = new Date(`${date.slice(0, 10)}T00:00:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function parseApiTime(time?: string) {
  const normalized = normalizeTime(time);
  const value = new Date();
  value.setSeconds(0, 0);

  if (!normalized) return value;

  const [hour, minute] = normalized.split(':').map(Number);
  value.setHours(hour, minute, 0, 0);
  return value;
}

export function formatDateForDisplay(date?: string) {
  const value = parseApiDate(date);
  if (!value) return '';

  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeForDisplay(time?: string) {
  const normalized = normalizeTime(time);
  if (!normalized) return '';

  const [hour, minute] = normalized.split(':').map(Number);
  const value = new Date();
  value.setHours(hour, minute, 0, 0);

  return value.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateTimeForDisplay(date?: string, time?: string) {
  if (date && !time && (date.includes('T') || date.includes(' '))) {
    const normalized = date.replace('T', ' ');
    const [apiDate = '', apiTime = ''] = normalized.split(' ');
    return formatDateTimeForDisplay(apiDate, apiTime.slice(0, 5));
  }

  const displayDate = formatDateForDisplay(date);
  const displayTime = formatTimeForDisplay(time);
  return [displayDate, displayTime].filter(Boolean).join(' ');
}

export function formatCheckedInAt(dateTime?: string | null) {
  const formatted = formatDateTimeForDisplay(dateTime || '');
  if (!formatted) return '';

  const [datePart, timePart] = formatted.split(' ');
  if (!datePart || !timePart) return formatted;
  const date = formatDateTimeForDisplay(dateTime || '').split(' ').slice(0, 3).join(' ');
  const time = formatDateTimeForDisplay(dateTime || '').split(' ').slice(3).join(' ');
  return time ? `Checked in ${date} at ${time}` : `Checked in ${formatted}`;
}

export function combineDateAndTime(date?: string, time?: string) {
  const normalizedTime = normalizeTime(time);
  if (!date || !normalizedTime) return null;

  const value = new Date(`${date.slice(0, 10)}T${normalizedTime}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function combineDateTimeForApi(date?: string, time?: string) {
  const normalizedTime = normalizeTime(time);
  return date && normalizedTime ? `${date.slice(0, 10)} ${normalizedTime}:00` : undefined;
}

export function isFutureDateTime(date?: string, time?: string) {
  const value = combineDateAndTime(date, time);
  return !!value && value.getTime() > Date.now();
}

export function isBeforeDateTime(
  firstDate?: string,
  firstTime?: string,
  secondDate?: string,
  secondTime?: string,
) {
  const first = combineDateAndTime(firstDate, firstTime);
  const second = combineDateAndTime(secondDate, secondTime);
  return !!first && !!second && first.getTime() < second.getTime();
}

export function isToday(date?: string) {
  const value = parseApiDate(date);
  if (!value) return false;

  const today = new Date();
  return formatDateForApi(value) === formatDateForApi(today);
}

export function splitApiDateTime(value?: string | null) {
  if (!value) return { date: '', time: '' };

  const normalized = value.replace('T', ' ');
  const [date = '', time = ''] = normalized.split(' ');

  return {
    date: date.slice(0, 10),
    time: normalizeTime(time.slice(0, 5)),
  };
}
