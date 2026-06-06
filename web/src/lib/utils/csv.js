/** Convert rows to CSV and trigger a browser download. Client-side only. */

/**
 * @param {Array<Record<string, any>>} rows
 * @param {string[]} [columns] explicit column order; defaults to keys of first row
 * @returns {string}
 */
export function toCSV(rows, columns) {
  if (!rows || rows.length === 0) return '';
  const cols = columns && columns.length ? columns : Object.keys(rows[0]);
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.join(',');
  const body = rows.map((r) => cols.map((c) => escape(r[c])).join(',')).join('\n');
  return `${header}\n${body}`;
}

/**
 * @param {string} filename
 * @param {string} csv
 */
export function downloadCSV(filename, csv) {
  if (typeof document === 'undefined') return;
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
