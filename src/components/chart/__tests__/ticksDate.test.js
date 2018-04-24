import { makeDateTimeTicks } from "../ticksDate.js";

describe("makeDateTimeTicks", () => {
  it("result ticks count should be less or equal than argument ticks count", () => {
    const ranges = [
      [new Date(2010, 0, 1), new Date(2014, 0, 1), 10],
      [new Date(2010, 0, 1), new Date(2012, 0, 1), 10]
    ];
    ranges.forEach(r => {
      const [start, end, count] = r;
      const ticks = makeDateTimeTicks([start, end], count);
      expect(ticks.length).toBeLessThanOrEqual(count);
      expect(ticks.length).toBeGreaterThanOrEqual(count / 2);
    });
  });
});
