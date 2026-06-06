/** Small formatting helpers used across pages. */

/**
 * @param {number|string|Date} value
 * @returns {string}
 */
export function formatDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  if (n == null || Number.isNaN(Number(n))) return '-';
  return Number(n).toLocaleString('en-US');
}

/**
 * Truncate text for table cells.
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
export function truncate(text, max = 80) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/** Map a status string to a tailwind text/bg tone. */
export const statusTone = {
  online: 'success',
  active: 'success',
  ready: 'primary',
  success: 'success',
  degraded: 'warning',
  hidden: 'warning',
  offline: 'danger',
  disabled: 'danger',
  error: 'danger'
};
