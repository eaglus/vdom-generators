export function alignToMonthStartUTC(timestamp) {
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  return Date.UTC(year, month, 1);
}

export function alignToMonthEndUTC(timestamp) {
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

export const durationSecond = 1000;
export const durationMinute = durationSecond * 60;
export const durationHour = durationMinute * 60;
export const durationDay = durationHour * 24;
export const durationWeek = durationDay * 7;
export const durationMonth = durationDay * 30;
export const durationYear = durationDay * 365;

export function splitDate(date) {
  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ];
}

export const alignToMonths = monthCnt => date => {
  const [year, month] = splitDate(date);
  const startMonth = new Date(year, month);

  if (month % monthCnt !== 0 || date > startMonth) {
    const monthAligned = month - month % monthCnt + monthCnt;
    return new Date(year, monthAligned, 1);
  }

  return date;
};

export const nextMonths = months => date => {
  const [year, month] = splitDate(date);
  return new Date(year, month + months, 1);
};

export const nextMonth = nextMonths(1);

export function getDaysInMonth(date) {
  const monthEnd = new Date(Number(nextMonth(date)) - durationDay);
  return monthEnd.getDate();
}

export const alignToDays = dayCnt => date => {
  const [year, month, day] = splitDate(date);
  const startDay = new Date(year, month, day);

  if (day % dayCnt !== 0 || date > startDay) {
    const dayAligned = day - day % dayCnt + dayCnt;
    return new Date(year, month, dayAligned);
  }
  return date;
};

export const nextDays = days => date => {
  const [year, month, day] = splitDate(date);
  return new Date(year, month, day + days);
};

export function alignToWeek(date) {
  let dateNum = Number(date);
  while (date.getDay() !== 1) {
    dateNum = dateNum + durationDay;
    date = new Date(dateNum);
  }
  return date;
}

export function nextWeek(date) {
  const nextDay = Number(date) + durationDay;
  return alignToWeek(new Date(nextDay));
}

export const alignToHours = hourCnt => date => {
  const [year, month, day, hour] = splitDate(date);
  const startHour = new Date(year, month, day, hour);

  if (hour % hourCnt !== 0 || date > startHour) {
    const hourAligned = hour - hour % hourCnt + hourCnt;
    return new Date(year, month, day, hourAligned);
  }
  return date;
};

export function alignToInterval(date, interval) {
  const dateNum = Math.ceil(Number(date) / interval) * interval;
  return new Date(dateNum);
}

export function nextByInterval(date, interval) {
  return new Date(Number(date) + interval);
}

export const alignToYears = years => date => {
  const year = date.getFullYear();
  const yearAligned = Math.floor(year / years) * years;
  const aligned = new Date(yearAligned, 0, 1);
  if (Number(aligned) !== Number(date)) {
    return new Date(yearAligned + years, 0, 1);
  } else {
    return aligned;
  }
};

export const nextYears = years => date => {
  const year = date.getFullYear();
  return new Date(year + years, 0, 1);
};
