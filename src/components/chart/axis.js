const step10 = Math.sqrt(50);
const step5 = Math.sqrt(10);
const step2 = Math.sqrt(2);

function makeLinearTicks(range, ticksCount) {
  const [start, end] = range;
  const step = (end - start) / Math.max(0, ticksCount);
  const power = Math.floor(Math.log(step) / Math.LN10);

  const stepNormalized = step / Math.pow(10, power);

  const stepRounded =
    stepNormalized >= step10
      ? 10
      : stepNormalized >= step5
        ? 5
        : stepNormalized >= step2
          ? 2
          : 1;

  const increment =
    power >= 0
      ? stepRounded * Math.pow(10, power)
      : -Math.pow(10, -power) / stepRounded;

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
      const cnt = endInt - startInt + 1;
      for (let i = 0; i !== cnt; i++) {
        result.push((startInt - i) / increment);
      }
    }
    return result;
  } else {
    return [];
  }
}

export function drawYAxis(
  context,
  chartPointToDataPoint,
  dataPointToChartPoint,
  left,
  top,
  width,
  height,
  fontHeight,
  color
) {
  const tickHeight = fontHeight * 2;
  const firstTickTop = Math.floor(top + tickHeight / 2);
  const lastTickTop = Math.floor(top + height - tickHeight / 2);
  const ticksCount = Math.floor((lastTickTop - firstTickTop) / tickHeight);
  const rangeStart = chartPointToDataPoint({
    x: left,
    y: firstTickTop
  }).value;
  const rangeStop = chartPointToDataPoint({
    x: left,
    y: lastTickTop
  }).value;

  context.fillStyle = color;
  context.font = fontHeight + "px sans-serif";
  const ticks = makeLinearTicks([rangeStart, rangeStop], ticksCount);
  const tickPadding = Math.round(tickHeight / 2);
  const tickLeft = left + tickPadding;
  for (let value of ticks) {
    const { y } = dataPointToChartPoint({ value });
    context.fillText(value, tickLeft, y, width - tickPadding);
  }
}
