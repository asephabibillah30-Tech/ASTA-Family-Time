/**
 * ASTA Family Time - Indonesian Date & Time Utilities
 * Formats dates into official Indonesian Locale with Day Name, Full Month Name, and WIB Timezone.
 * Example: "Sabtu, 12 September 2026 • 16:00 WIB"
 */

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const SHORT_MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okto', 'Nov', 'Des'
];

/**
 * Formats a Date object or ISO string / YYYY-MM-DD string to Indonesian format with day name.
 * Example: formatIndonesianDate("2026-09-12", "16:00") => "Sabtu, 12 September 2026 • 16:00 WIB"
 */
export function formatIndonesianDate(
  dateInput?: string | Date | number,
  timeStr?: string,
  options?: { shortMonth?: boolean; includeTimezone?: boolean }
): string {
  if (!dateInput) return '';

  try {
    let year: number;
    let month: number; // 0-indexed
    let day: number;
    let dateObj: Date;

    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const parts = dateInput.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
      dateObj = new Date(year, month, day);
    } else {
      dateObj = new Date(dateInput);
      if (isNaN(dateObj.getTime())) return String(dateInput);
      year = dateObj.getFullYear();
      month = dateObj.getMonth();
      day = dateObj.getDate();
    }

    const dayName = DAYS_ID[dateObj.getDay()];
    const monthName = options?.shortMonth ? SHORT_MONTHS_ID[month] : MONTHS_ID[month];

    let result = `${dayName}, ${day} ${monthName} ${year}`;
    if (timeStr) {
      const tz = options?.includeTimezone !== false ? ' WIB' : '';
      result += ` • ${timeStr}${tz}`;
    }

    return result;
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats relative timestamp for chat or notifications in Indonesian.
 * Example: "Baru saja", "5 mnt lalu", "Jumat, 11 Sep 2026 • 10:44 WIB"
 */
export function formatRelativeIndonesianTime(timestamp: number | string): string {
  if (!timestamp) return '';
  const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (isNaN(ts)) return String(timestamp);

  const diff = Date.now() - ts;
  if (diff < 60000) return 'Baru saja';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt lalu`;

  const dateObj = new Date(ts);
  const dayName = DAYS_ID[dateObj.getDay()];
  const dateNum = dateObj.getDate();
  const monthName = SHORT_MONTHS_ID[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${dayName}, ${dateNum} ${monthName} ${year} • ${hours}:${minutes} WIB`;
}
