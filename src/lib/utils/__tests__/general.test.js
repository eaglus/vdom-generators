import {lowerBound, upperBound} from '../index.js';

describe("lower bound / uper bound", () => {
  const data = [0, 1, 2, 3, 4, 5];
  const compareFn = (v1, v2) => v1 - v2;

  test("lower bound", () => {
    expect(lowerBound(data, 111, compareFn)).toEqual(6);
    expect(lowerBound(data, -1, compareFn)).toEqual(0);
    expect(lowerBound(data, 1.5, compareFn)).toEqual(2);
    expect(lowerBound([], 1.5, compareFn)).toEqual(0);
  });

  test("upper bound", () => {
    expect(upperBound(data, 111, compareFn)).toEqual(5);
    expect(upperBound(data, -1, compareFn)).toEqual(-1);
    expect(upperBound(data, 1.5, compareFn)).toEqual(1);
    expect(upperBound([], 1.5, compareFn)).toEqual(-1);
  });
});
