import { lowerBound, compose } from "../../lib/utils/index.js";
import { getStepIncrement } from "./ticksLinear.js";

const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;

function splitDate(date) {
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

  let monthAligned = month;
  if (month % monthCnt !== 0) {
    monthAligned = month - month % monthCnt + monthCnt;
  }
  return new Date(year, monthAligned, 1);
};

export const nextMonths = months => date => {
  const [year, month] = splitDate(date);
  const nextMonth = (month + months) % 12;
  const yearAdd = nextMonth < month ? 1 : 0;
  return new Date(year + yearAdd, nextMonth, 1);
};

const nextMonth = nextMonths(1);

function getDaysInMonth(date) {
  const monthEnd = new Date(Number(nextMonth(date)) - durationDay);
  return monthEnd.getDate();
}

const alignToDays = dayCnt => date => {
  const [year, month, day] = splitDate(date);

  let dayAligned = day;
  if (day % dayCnt !== 0) {
    dayAligned = day - day % dayCnt + dayCnt;
  }
  return new Date(year, month, dayAligned);
};

const nextDays = days => date => {
  const dayCount = getDaysInMonth(date);

  const [year, month, day] = splitDate(date);
  const nextDay = (day + days) % dayCount;
  if (nextDay < day) {
    return nextMonth(date);
  } else {
    return new Date(year, month, nextDay);
  }
};

function alignToWeekOrMonth(date) {
  let dateNum = Number(date);
  //while (date.getDay() !== 1 && date.getDate() !== 1) {
  while (date.getDay() !== 1) {
    dateNum = dateNum + durationDay;
    date = new Date(dateNum);
  }
  return date;
}

function nextWeekOrMonth(date) {
  const nextDay = Number(date) + durationDay;
  return alignToWeekOrMonth(new Date(nextDay));
}

function alignByInterval(date, interval) {
  const dateNum = Math.ceil(Number(date) / interval) * interval;
  return new Date(dateNum);
}

function nextByInterval(date, interval) {
  const dateNum = interval + Math.ceil(Number(date) / interval) * interval;
  return new Date(dateNum);
}

function firstChangedPartIdx(date, prevDate) {
  const split = splitDate(date);
  const prevSplit = splitDate(prevDate);
  return split.findIndex((part, i) => part !== prevSplit[i]);
}

const formatTime = withSeconds => (date, prevDate) => {
  const changeStart = firstChangedPartIdx(date, prevDate);

  const timeStrOpts = {
    hour: "numeric",
    minute: "numeric"
  };

  if (withSeconds) {
    timeStrOpts.second = "numeric";
  }

  const timeStr = date.toLocaleTimeString(undefined, timeStrOpts);

  if (date === prevDate || changeStart < 3) {
    const dateStrOpts = {
      year: "numeric",
      month: "short",
      day: "numeric"
    };

    const dateStr = date.toLocaleDateString(undefined, dateStrOpts);
    return [timeStr, dateStr];
  } else {
    return [timeStr];
  }
};

function formatDate(date, prevDate) {
  const changeStart = firstChangedPartIdx(date, prevDate);

  const dateStrOpts = {
    month: "short",
    day: "numeric"
  };

  const dateStr = date.toLocaleDateString(undefined, dateStrOpts);
  const result = [dateStr];
  if (date === prevDate || changeStart < 1) {
    result.push(String(date.getFullYear()));
  }
  return result;
}

function formatYear(date) {
  return [String(date.getFullYear())];
}

function calculateYearsInterval(step) {
  const stepYear = step / durationYear;
  const interval = getStepIncrement(Math.ceil(stepYear));

  const getAligned = date => {
    const year = date.getFullYear();
    return new Date(Math.ceil(year / interval) * interval, 0, 1);
  };

  const getNext = date => {
    const year = date.getFullYear();
    return new Date(year + interval, 0, 1);
  };

  return [interval, getAligned, getNext, formatYear];
}

export function makeDateTimeTicks(range, ticksCount) {
  const simpleIntervalsSeconds = [
    durationSecond,
    5 * durationSecond,
    15 * durationSecond,
    30 * durationSecond
  ].map(interval => [
    interval,
    alignByInterval,
    nextByInterval,
    formatTime(true)
  ]);

  const simpleIntervals = [
    ...simpleIntervalsSeconds,
    durationSecond,
    5 * durationSecond,
    15 * durationSecond,
    30 * durationSecond,
    durationMinute,
    5 * durationMinute,
    15 * durationMinute,
    30 * durationMinute,
    durationHour,
    3 * durationHour,
    6 * durationHour,
    12 * durationHour
  ].map(interval => [
    interval,
    alignByInterval,
    nextByInterval,
    formatTime(false)
  ]);

  const tickIntervals = [
    ...simpleIntervals,
    [durationDay, alignByInterval, nextByInterval, formatDate],
    [2 * durationDay, alignToDays(2), nextDays(2), formatDate],
    [durationWeek, alignToWeekOrMonth, nextWeekOrMonth, formatDate],
    [
      durationWeek * 2,
      alignToWeekOrMonth,
      compose(nextWeekOrMonth, nextWeekOrMonth),
      formatDate
    ],
    [durationMonth, alignToMonths(1), nextMonths(1), formatDate],
    [3 * durationMonth, alignToMonths(3), nextMonths(3), formatDate],
    [6 * durationMonth, alignToMonths(6), nextMonths(6), formatDate],
    durationYear
  ];

  const [start, end] = range;
  const step = (end - start) / ticksCount;

  const compareStep = interval => interval[0] - step;
  const intervalIdx = lowerBound(tickIntervals, step, compareStep);

  const [interval, getAligned, getNext, format] =
    intervalIdx < tickIntervals.length - 1
      ? tickIntervals[intervalIdx]
      : calculateYearsInterval(step);

  const startAligned = getAligned(new Date(start), interval);
  const endDate = new Date(end);
  const ticks = [];
  let prevDate = startAligned;
  for (
    let date = startAligned;
    date < endDate;
    date = getNext(date, interval)
  ) {
    ticks.push({
      date: Number(date),
      labels: format(date, prevDate)
    });
    prevDate = date;
  }
  return ticks;
}
