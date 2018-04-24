import { lowerBound } from "../../lib/utils/index.js";
import { makeLinearTicks } from "./ticksLinear.js";

const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;

function splitDate(ts) {
  const date = new Date(ts);
  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ];
}

function formatTime(date, secondsDiffers) {
  const options = {
    minute: "numeric",
    hour: "numeric"
  };

  if (secondsDiffers) {
    options.second = "numeric";
  }

  return date.toLocaleTimeString(undefined, options);
}

function findLastIndex(array, callback) {
  for (let i = array.length - 1; i !== -1; i--) {
    if (callback(array[i], i)) {
      return i;
    }
  }
  return -1;
}

function dateTimeFormatter(prevDate, date) {
  if (prevDate === date) {
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  } else {
    const prevSplit = splitDate(prevDate);
    const split = splitDate(date);
    const diffStart = split.findIndex((part, i) => part !== prevSplit[i]);
    const diffEnd = findLastIndex(split, (part, i) => part !== prevSplit[i]);

    if (diffEnd > 2) {
      const timeStr = formatTime(date, diffEnd === 5);
      if (diffStart >= 0 && diffStart < 3) {
        return [timeStr, date.toLocaleDateString()];
      } else {
        return [timeStr];
      }
    } else {
      const dateStr = date.toLocaleDateString(undefined, {
        month: "numeric",
        day: "numeric"
      });

      if (diffStart > 0) {
        return [dateStr];
      } else if (split[1] !== prevSplit[1] || split[2] !== prevSplit[2]) {
        return [dateStr, split[0]];
      } else {
        return [split[0]];
      }
    }
  }
}

function alignToWeek(date) {
  while (new Date(date).getDay() !== 1) {
    date = date + durationDay;
  }
  return date;
}

function alignToMonth(date) {
  const [year, month, day] = splitDate(date).slice(0, 3);
  if (day !== 1) {
    return nextMonth(new Date(year, month, 1));
  } else {
    return date;
  }
}

function alignTo3Month(date) {
  const [year, month] = splitDate(date).slice(0, 3);

  let monthAligned = month;
  if (month % 3 !== 0) {
    if (month < 3) {
      monthAligned = 0;
    } else {
      monthAligned = month - month % 3 + 3;
    }
  }
  return new Date(year, monthAligned, 1);
}

function nextWeek(date) {
  return new Date(Number(date) + durationWeek);
}

function nextMonth(date) {
  const split = splitDate(date).slice(0, 3);
  if (split[1] === 11) {
    return new Date(split[0] + 1, 0, 1);
  } else {
    split[1]++;
    return new Date(split);
  }
}

function next3Month(date) {
  const split = splitDate(date).slice(0, 3);
  if (split[1] > 8) {
    return new Date(split[0] + 1, 0, 1);
  } else {
    split[1] += 3;
    return new Date(split);
  }
}

export function makeDateTimeTicks(range, ticksCount) {
  const tickIntervals = [
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
    12 * durationHour,
    durationDay,
    2 * durationDay,
    [durationWeek, alignToWeek, nextWeek],
    [durationMonth, alignToMonth, nextMonth],
    [3 * durationMonth, alignTo3Month, next3Month],
    durationYear
  ];

  const [start, end] = range;
  const step = (end - start) / ticksCount;

  const compareStep = interval =>
    Array.isArray(interval) ? interval[0] - step : interval - step;

  const intervalIdx = lowerBound(tickIntervals, step, compareStep);

  if (intervalIdx >= tickIntervals.length - 1) {
    const startYear = new Date(start).getFullYear();
    const endYear = new Date(end).getFullYear();
    const rangeYear = [startYear, endYear];
    return makeLinearTicks(rangeYear, ticksCount).map(year => ({
      date: Number(new Date(year, 0, 1)),
      labels: [year]
    }));
  } else if (intervalIdx === 0) {
    return makeLinearTicks(range, ticksCount).map(milliseconds => ({
      date: milliseconds,
      labels: [milliseconds]
    }));
  } else {
    let interval, getAligned, getNext;
    if (Array.isArray(tickIntervals[intervalIdx])) {
      [interval, getAligned, getNext] = tickIntervals[intervalIdx];
    } else {
      getAligned = date => date;
      getNext = date => date + interval;
    }

    const startAligned = getAligned(Math.floor(start / interval) * interval);
    const ticks = [];
    let prevDate = startAligned;
    for (let date = startAligned; date < end; date = getNext(date)) {
      const diff = date - prevDate;
      if (diff === 0 || diff > interval) {
        ticks.push({
          date: Number(date),
          labels: dateTimeFormatter(prevDate, date)
        });
        prevDate = date;
      }
    }
    return ticks;
  }
}
