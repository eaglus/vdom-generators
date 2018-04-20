export function alignToMonthStart(timestamp) {
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  return Date.UTC(year, month, 1);
}

export function alignToMonthEnd(timestamp) {
  const date = new Date(timestamp);

  const month = date.getUTCMonth();
  const isLastMonth = month === 12;

  const year = date.getUTCFullYear() + (isLastMonth ? 1 : 0);

  const nextMonth = isLastMonth ? 0 : month + 1;

  const lastDayEndTs = Number(new Date(year, nextMonth, 1)) - 1;
  const lastDayEnd = new Date(lastDayEndTs);

  const lastDayMonth = lastDayEnd.getUTCMonth();
  const lastDayYear = lastDayEnd.getUTCFullYear();
  const lastDayDay = lastDayEnd.getUTCDate();
  return Date.UTC(lastDayYear, lastDayMonth, lastDayDay);
}
