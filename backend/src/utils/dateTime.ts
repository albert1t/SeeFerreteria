const BUSINESS_TIME_ZONE = 'Europe/Madrid';

function wallClockEpoch(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Date.UTC(
    Number(value.year), Number(value.month) - 1, Number(value.day),
    Number(value.hour), Number(value.minute), Number(value.second),
  );
}

function localMidnightToUtc(year: number, month: number, day: number): Date {
  const targetWallClock = Date.UTC(year, month - 1, day);
  let guess = targetWallClock;
  // Recalcula el desfase con Intl para que las fechas de cambio horario (CET/CEST) queden bien.
  for (let i = 0; i < 4; i += 1) {
    guess += targetWallClock - wallClockEpoch(new Date(guess));
  }
  return new Date(guess);
}

export function madridDateUtcRange(dateValue: string): [Date, Date] {
  const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error('Fecha inválida');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
  return [
    localMidnightToUtc(year, month, day),
    localMidnightToUtc(nextDay.getUTCFullYear(), nextDay.getUTCMonth() + 1, nextDay.getUTCDate()),
  ];
}
