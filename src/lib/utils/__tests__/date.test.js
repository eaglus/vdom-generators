import {
  alignToDays,
  alignToMonthEndUTC,
  alignToMonths,
  alignToMonthStartUTC,
  alignToYears,
  getDaysInMonth, nextDays,
  nextMonth,
  nextMonths,
  nextYears
} from "../date";

function getResultTable(checkTable, fn) {
  return checkTable.map(([date]) => {
    const dateUTC = Date.UTC(date[0], date[1], date[2]);
    const aligned = new Date(fn(dateUTC));

    const year = aligned.getUTCFullYear();
    const month = aligned.getUTCMonth();
    const day = aligned.getUTCDate();
    return [date, [year, month, day]];
  });
}

function splitToDate(split) {
  switch (split.length) {
    case 3:
      return new Date(split[0], split[1], split[2]);
    case 4:
      return new Date(split[0], split[1], split[2], split[3]);
    case 5:
      return new Date(split[0], split[1], split[2], split[3], split[4]);
    case 6:
      return new Date(
        split[0],
        split[1],
        split[2],
        split[3],
        split[4],
        split[5]
      );
  }
}

describe("date", () => {
  test("align to month start", () => {
    const expected = [
      [[2017, 10, 10], [2017, 10, 1]],
      [[2017, 10, 1], [2017, 10, 1]],
      [[2017, 10, 30], [2017, 10, 1]]
    ];

    const actual = getResultTable(expected, alignToMonthStartUTC);
    expect(actual).toEqual(expected);
  });

  test("align to month end", () => {
    const expected = [
      [[2017, 10, 10], [2017, 10, 30]],
      [[2017, 10, 30], [2017, 10, 30]],
      [[2017, 11, 30], [2017, 11, 31]]
    ];

    const actual = getResultTable(expected, alignToMonthEndUTC);
    expect(actual).toEqual(expected);
  });

  test("align by years", () => {
    const cases = [
      [2, [2018, 0, 1], [2018, 0, 1]],
      [3, [2016, 0, 1], [2016, 0, 1]],

      [2, [2017, 10, 10], [2018, 0, 1]],
      [2, [2016, 10, 10], [2018, 0, 1]],
      [1, [2018, 2, 13], [2019, 0, 1]],
      [3, [2018, 2, 11], [2019, 0, 1]]
    ];

    cases.forEach(([interval, source, check]) => {
      const align = alignToYears(interval);
      const aligned = align(splitToDate(source));
      expect(aligned).toEqual(splitToDate(check));
    });
  });

  test("next by years", () => {
    const cases = [
      [2, [2018, 0, 1], [2020, 0, 1]],

      [2, [2017, 10, 10], [2018, 0, 1]],
      [2, [2016, 10, 10], [2018, 0, 1]],
      [5, [2016, 10, 10], [2020, 0, 1]],
      [1, [2018, 2, 13], [2019, 0, 1]]
    ];

    cases.forEach(([interval, source, check]) => {
      const next = nextYears(interval)(splitToDate(source));
      expect(next).toEqual(splitToDate(check));
    });
  });

  test("align by months", () => {
    const cases = [
      [2, [2018, 0, 1], [2018, 0, 1]],
      [3, [2016, 0, 11], [2016, 3, 1]],
      [2, [2017, 10, 10], [2018, 0, 1]],
      [3, [2017, 10, 10], [2018, 0, 1]],
      [6, [2017, 10, 10], [2018, 0, 1]],
      [3, [2017, 9, 1], [2017, 9, 1]],
      [3, [2017, 8, 1], [2017, 9, 1]]
    ];

    cases.forEach(([interval, source, check]) => {
      const align = alignToMonths(interval);
      const aligned = align(splitToDate(source));
      expect(aligned).toEqual(splitToDate(check));
    });
  });

  test("next by months", () => {
    const cases = [
      [2, [2018, 0, 1], [2018, 2, 1]],
      [3, [2016, 0, 11], [2016, 3, 1]],
      [3, [2017, 11, 10], [2018, 2, 1]],
      [3, [2017, 10, 10], [2018, 1, 1]],
      [1, [2017, 10, 10], [2017, 11, 1]],
      [6, [2017, 9, 1], [2018, 3, 1]]
    ];

    cases.forEach(([interval, source, check]) => {
      const next = nextMonths(interval)(splitToDate(source));
      expect(next).toEqual(splitToDate(check));
    });
  });

  test("getDaysInMonth", () => {
    const cases = [
      [[2018, 0, 1], 31],
      [[2016, 1, 11], 29],
      [[2001, 1, 11], 28],
      [[2016, 3, 11], 30]
    ];

    cases.forEach(([date, monthDays]) => {
      expect(getDaysInMonth(splitToDate(date))).toEqual(monthDays);
    });
  });

  test("align by days", () => {
    const cases = [
      [2, [2018, 0, 1], [2018, 0, 2]],
      [1, [2018, 0, 3], [2018, 0, 3]],
      [1, [2018, 0, 3, 13], [2018, 0, 4]],
      [2, [2018, 0, 1, 3], [2018, 0, 2]],
      [3, [2016, 0, 11, 12], [2016, 0, 12]]
    ];

    cases.forEach(([interval, source, check]) => {
      const align = alignToDays(interval);
      const aligned = align(splitToDate(source));
      expect(aligned).toEqual(splitToDate(check));
    });
  });

  test("next by days", () => {
    const cases = [
      [2, [2018, 0, 2], [2018, 0, 4]],
      [2, [2018, 0, 2, 3], [2018, 0, 4]],
      [3, [2016, 0, 3, 12], [2016, 0, 6]],
      [3, [2016, 0, 30, 12], [2016, 1, 1]]
    ];

    cases.forEach(([interval, source, check]) => {
      const next = nextDays(interval)(splitToDate(source));
      expect(next).toEqual(splitToDate(check));
    });
  });
});
