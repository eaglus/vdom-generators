import { lowerBound, compose } from "../../lib/utils/index.js";
import { getStepIncrement } from "./ticksLinear.js";
import {
  alignToInterval,
  alignToDays,
  alignToMonths,
  alignToWeek,
  durationDay,
  durationHour,
  durationMinute,
  durationMonth,
  durationSecond,
  durationWeek,
  durationYear,
  nextByInterval,
  nextDays,
  nextMonths,
  nextWeek,
  splitDate,
  alignToYears,
  nextYears,
  alignToHours
} from "../../lib/utils/date.js";

const zeroPadding = digits => number => {
  return String(number).padStart(digits, "0");
};

const zeroPadding2 = zeroPadding(2);

function firstChangedPartIdx(date, prevDate) {
  const split = splitDate(date);
  const prevSplit = splitDate(prevDate);
  return split.findIndex((part, i) => part !== prevSplit[i]);
}

function monthToName(month) {
  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ][month];
}

const formatTime = withSeconds => (date, prevDate) => {
  const changeStart = firstChangedPartIdx(date, prevDate);
  const [year, month, day, hour, minute, second] = splitDate(date);

  const timeParts = withSeconds ? [hour, minute, second] : [hour, minute];
  const timeStr = timeParts.map(zeroPadding2).join(":");

  if (date === prevDate || changeStart < 3) {
    const dateStr = `${monthToName(month)} ${day}, ${year}`;
    return [timeStr, dateStr];
  } else {
    return [timeStr];
  }
};

const formatDate = withDays => (date, prevDate) => {
  const [year, month, day] = splitDate(date);
  const [prevYear, prevMonth] = splitDate(prevDate);

  const monthStr = monthToName(month);
  const datePart = [];
  if (withDays) {
    if (date === prevDate || prevMonth !== month) {
      datePart.push(monthStr);
    }
    datePart.push(day);
  } else {
    datePart.push(monthStr);
  }
  const dateStr = datePart.join(" ");
  const result = [dateStr];

  if (date === prevDate || year !== prevYear) {
    result.push(String(year));
  }
  return result;
};

function formatYear(date) {
  return [String(date.getFullYear())];
}

function calculateYearsInterval(step) {
  const stepYear = step / durationYear;
  const interval = getStepIncrement(Math.ceil(stepYear));

  return [interval, alignToYears(interval), nextYears(interval), formatYear];
}

export function makeDateTimeTicks(range, ticksCount) {
  const simpleIntervalsSeconds = [
    durationSecond,
    5 * durationSecond,
    15 * durationSecond,
    30 * durationSecond
  ].map(interval => [
    interval,
    alignToInterval,
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
    30 * durationMinute
  ].map(interval => [
    interval,
    alignToInterval,
    nextByInterval,
    formatTime(false)
  ]);

  const tickIntervals = [
    ...simpleIntervals,
    [1 * durationHour, alignToHours(1), nextByInterval, formatTime(false)],
    [3 * durationHour, alignToHours(3), nextByInterval, formatTime(false)],
    [6 * durationHour, alignToHours(6), nextByInterval, formatTime(false)],
    [12 * durationHour, alignToHours(12), nextByInterval, formatTime(false)],
    [durationDay, alignToDays(1), nextDays(1), formatDate(true)],
    [2 * durationDay, alignToDays(2), nextDays(2), formatDate(true)],
    [durationWeek, alignToWeek, nextWeek, formatDate(true)],
    [
      durationWeek * 2,
      alignToWeek,
      compose(nextWeek, nextWeek),
      formatDate(true)
    ],
    [durationMonth, alignToMonths(1), nextMonths(1), formatDate(false)],
    [3 * durationMonth, alignToMonths(3), nextMonths(3), formatDate(false)],
    [6 * durationMonth, alignToMonths(6), nextMonths(6), formatDate(false)],
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
