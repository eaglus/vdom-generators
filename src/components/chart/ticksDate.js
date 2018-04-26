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

function firstChangedPartIdx(date, prevDate) {
  const split = splitDate(date);
  const prevSplit = splitDate(prevDate);
  return split.findIndex((part, i) => part !== prevSplit[i]);
}

const formatTime = withSeconds => (date, prevDate) => {
  const changeStart = firstChangedPartIdx(date, prevDate);
  const [year, month, day, hour, minute, second] = splitDate(date);

  const timeParts = withSeconds ? [hour, minute, second] : [hour, minute];
  const timeStr = timeParts.join(":");

  if (date === prevDate || changeStart < 3) {
    const dateStr = `${year} ${month} ${day}`;
    return [timeStr, dateStr];
  } else {
    return [timeStr];
  }
};

function formatDate(date, prevDate) {
  const changeStart = firstChangedPartIdx(date, prevDate);
  const [year, month, day] = splitDate(date);

  const dateStr = `${month + 1}.${day}`;
  const result = [dateStr];
  if (date === prevDate || changeStart < 1) {
    result.push(String(year));
  }
  return result;
}

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
    [durationDay, alignToDays(1), nextDays(1), formatDate],
    [2 * durationDay, alignToDays(2), nextDays(2), formatDate],
    [durationWeek, alignToWeek, nextWeek, formatDate],
    [durationWeek * 2, alignToWeek, compose(nextWeek, nextWeek), formatDate],
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
