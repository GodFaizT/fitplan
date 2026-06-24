/** Formatação de números e datas (pt-PT). */

export function fmt(n: number, digits = 0): string {
  return n.toLocaleString('pt-PT', { maximumFractionDigits: digits });
}

/** "YYYY-MM-DD" na timezone local. */
export function localISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return localISO(new Date());
}

export function addDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return localISO(d);
}

const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];
const MONTHS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

/** 0 = Domingo … 6 = Sábado. */
export function weekdayIndex(iso: string): number {
  return new Date(`${iso}T00:00:00`).getDay();
}

/** "23 jun" — data curta para eixos/legendas de gráficos. */
export function chartDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "Hoje", "Ontem", "Amanhã" ou "Segunda, 23 jun". */
export function dateLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Hoje';
  if (iso === addDays(today, -1)) return 'Ontem';
  if (iso === addDays(today, 1)) return 'Amanhã';
  const d = new Date(`${iso}T00:00:00`);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
