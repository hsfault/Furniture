import { pad2 } from './format.js';

// Light is shown for the visitor's own clock. Pakistan's zone is "Asia/Karachi"
// but the showroom is in Lahore, so we name it that.
export function localLightLabel(date = new Date()) {
  let city = 'your city';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    city = tz === 'Asia/Karachi' ? 'Lahore' : (tz.split('/').pop() || city).replace(/_/g, ' ');
  } catch { /* keep default */ }
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  return `Light: ${city}, ${time}`;
}

export const hourFloat = (date = new Date()) => date.getHours() + date.getMinutes() / 60;

// Lahore time (UTC+5, no DST) for showroom open/closed.
export function lahoreNow() {
  const now = new Date();
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 5 * 3600000);
}

export function openStatus(hours) {
  const now = lahoreNow();
  const today = hours[now.getDay()];
  const h = hourFloat(now);
  const open = today.open !== null && h >= today.open && h < today.close;
  return { open, dayIndex: now.getDay() };
}

export const fmtHour = (h) => (h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`);

export function nextDays(n = 7, from = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

export const dayShort = (d) => d.toLocaleDateString('en-US', { weekday: 'short' });
export const dayLong = (d) => d.toLocaleDateString('en-US', { weekday: 'long' });
export const dateShort = (d) => `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`;
export const dateLong = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

export function clockFromProgress(p, startHour = 7, endHour = 23) {
  const mins = Math.round((startHour + (endHour - startHour) * p) * 60);
  return `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;
}
