import { alignToMonthEnd, alignToMonthStart } from "../date";

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

describe("date", () => {
  it("align to month start", () => {
    const expected = [
      [[2017, 10, 10], [2017, 10, 1]],
      [[2017, 10, 1], [2017, 10, 1]],
      [[2017, 10, 30], [2017, 10, 1]]
    ];

    const actual = getResultTable(expected, alignToMonthStart);
    expect(actual).toEqual(expected);
  });

  it("align to month end", () => {
    const expected = [
      [[2017, 10, 10], [2017, 10, 30]],
      [[2017, 10, 30], [2017, 10, 30]],
      [[2017, 11, 30], [2017, 11, 31]]
    ];

    const actual = getResultTable(expected, alignToMonthEnd);
    expect(actual).toEqual(expected);
  });
});
