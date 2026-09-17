const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 КБ';
  }

  const gb = Math.floor(bytes / GB);
  const mb = Math.floor((bytes - gb * GB) / MB);
  const kb = Math.floor((bytes - gb * GB - mb * MB) / KB);

  if (gb > 0) {
    return `${gb} ГБ ${mb} МБ ${kb} КБ`;
  }
  if (mb > 0) {
    return `${mb} МБ ${kb} КБ`;
  }
  return `${kb} КБ`;
}
