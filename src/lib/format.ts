export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')} млн`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.0', '')} тыс.`;
  return String(n);
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  const units: [number, string, string, string][] = [
    [31536000, 'год', 'года', 'лет'],
    [2592000, 'месяц', 'месяца', 'месяцев'],
    [604800, 'неделю', 'недели', 'недель'],
    [86400, 'день', 'дня', 'дней'],
    [3600, 'час', 'часа', 'часов'],
    [60, 'минуту', 'минуты', 'минут'],
  ];
  for (const [s, one, few, many] of units) {
    const v = Math.floor(sec / s);
    if (v >= 1) return `${v} ${plural(v, one, few, many)} назад`;
  }
  return 'только что';
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function formatDuration(sec: number): string {
  if (!sec || sec < 0) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`;
  return `${m}:${ss}`;
}
