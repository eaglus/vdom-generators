import { makeLinearTicks } from "./ticksLinear.js";
import { makeDateTimeTicks } from "./ticksDate.js";

function applyStyle({ context, fontHeight, color, tickLineColor }) {
  context.fillStyle = color;
  context.font = fontHeight + "px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "top";
  context.strokeStyle = tickLineColor;
}

const tickLinePadding = 2;
const tickLineLength = 10;

export function drawYAxis(options) {
  const {
    context,
    chartPointToDataPoint,
    dataPointToChartPoint,
    left,
    top,
    width,
    height,
    fontHeight
  } = options;

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

  applyStyle(options);

  context.textAlign = "left";
  context.textBaseline = "middle";

  context.beginPath();
  const ticks = makeLinearTicks([rangeStart, rangeStop], ticksCount);
  for (let value of ticks) {
    const { y } = dataPointToChartPoint({ value });
    const tickEnd = left + tickLinePadding + tickLineLength;
    context.fillText(value, tickEnd + tickLinePadding, y, width);

    context.moveTo(left + tickLinePadding, y);
    context.lineTo(tickEnd, y);
  }

  context.stroke();
}

export function drawXAxis(options) {
  const {
    context,
    chartPointToDataPoint,
    dataPointToChartPoint,
    left,
    top,
    width,
    fontHeight,
    labelWidth
  } = options;

  const tickHeight = fontHeight * 2;
  const tickTop = Math.floor(top + tickHeight / 2);
  const ticksCount = Math.floor((width - labelWidth) / labelWidth);
  const rangeStart = chartPointToDataPoint({
    x: left + labelWidth / 2,
    y: tickTop
  }).date;
  const rangeStop = chartPointToDataPoint({
    x: left + width - labelWidth,
    y: tickTop
  }).date;

  applyStyle(options);

  context.textAlign = "center";
  context.textBaseline = "top";

  const ticks = makeDateTimeTicks([rangeStart, rangeStop], ticksCount);
  context.beginPath();
  for (let tick of ticks) {
    const { date, labels } = tick;
    const { x } = dataPointToChartPoint({ date });

    context.fillText(labels[0], x, tickTop, labelWidth);
    if (labels[1]) {
      context.fillText(labels[1], x, tickTop + fontHeight * 1.25, labelWidth);
    }
    context.moveTo(x, tickTop - tickLineLength - tickLinePadding);
    context.lineTo(x, tickTop - tickLinePadding);
  }
  context.stroke();
}
