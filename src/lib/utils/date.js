export function alignToMonthStart(timestamp) {
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  return new Date(year, month, 0);
}

export function alignToMonthEnd(timestamp) {
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const isLastMonth = month === 12;
  const year = date.getUTCFullYear() + (isLastMonth ? 1 : 0);
  const nextMonth = isLastMonth ? 0 : (month + 1);
  const lastDayEndTs = Number(new Date(year, nextMonth, 0)) - 1;
  const lastDayEnd = new Date(lastDayEndTs);

  const lastDayMonth = lastDayEnd.getUTCMonth();
  const lastDayYear = lastDayEnd.getUTCFullYear();
  const lastDayDay = lastDayEnd.getUTCDay();
  return new Date(lastDayYear, lastDayMonth, lastDayDay);
}
