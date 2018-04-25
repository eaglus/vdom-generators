const step10 = Math.sqrt(50);
const step5 = Math.sqrt(10);
const step2 = Math.sqrt(2);

export function getStepIncrement(step) {
  const power = Math.floor(Math.log10(step));

  const stepNormalized = step / Math.pow(10, power);

  const stepRounded =
    stepNormalized >= step10
      ? 10
      : stepNormalized >= step5
        ? 5
        : stepNormalized >= step2
          ? 2
          : 1;

  return power >= 0
    ? stepRounded * Math.pow(10, power)
    : -Math.pow(10, -power) / stepRounded;
}

export function makeLinearTicks(range, ticksCount) {
  const [start, end] = range;
  const step = (end - start) / ticksCount;
  const increment = getStepIncrement(step);

  if (increment !== 0 && isFinite(increment)) {
    const result = [];
    if (increment > 0) {
      const startInt = Math.ceil(start / increment);
      const endInt = Math.floor(end / increment);
      const cnt = endInt - startInt + 1;
      for (let i = 0; i !== cnt; i++) {
        result.push((startInt + i) * increment);
      }
    } else {
      const startInt = Math.floor(start * increment);
      const endInt = Math.ceil(end * increment);
      const cnt = Math.abs(endInt - startInt + 1);
      for (let i = 0; i !== cnt; i++) {
        result.push((startInt - i) / increment);
      }
    }
    return result;
  } else {
    return [];
  }
}
