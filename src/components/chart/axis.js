import { makeLinearTicks } from "./ticksLinear.js";
import { makeDateTimeTicks } from "./ticksDate.js";

export function drawYAxis({
  context,
  chartPointToDataPoint,
  dataPointToChartPoint,
  left,
  top,
  width,
  height,
  fontHeight,
  color
}) {
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
  for (let value of ticks) {
    const { y } = dataPointToChartPoint({ value });
    context.fillText(value, left, y, width);
  }
}

export function drawXAxis({
  context,
  chartPointToDataPoint,
  dataPointToChartPoint,
  left,
  top,
  width,
  fontHeight,
  color,
  labelWidth
}) {
  const tickHeight = fontHeight * 2;
  const tickTop = Math.floor(top + tickHeight / 2);
  const ticksCount = Math.floor(width / labelWidth);
  const rangeStart = chartPointToDataPoint({
    x: left,
    y: tickTop
  }).date;
  const rangeStop = chartPointToDataPoint({
    x: left + width,
    y: tickTop
  }).date;

  context.fillStyle = color;
  context.font = fontHeight + "px sans-serif";

  const ticks = makeDateTimeTicks([rangeStart, rangeStop], ticksCount);
  for (let tick of ticks) {
    const { date, labels } = tick;
    const { x } = dataPointToChartPoint({ date });

    context.fillText(labels[0], x, tickTop, labelWidth);
    if (labels[1]) {
      context.fillText(labels[1], x, tickTop + fontHeight * 2, labelWidth);
    }
  }
}
