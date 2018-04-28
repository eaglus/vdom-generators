import { compose } from "../../lib/utils/index.js";

const pointsAreClose = diff => (p1, p2) => {
  return p2.date - p1.date < diff;
};

function bisect(arr, fn) {
  return arr.reduce(
    (result, item) => {
      const { left, right } = result;
      if (fn(item)) {
        right.push(item);
      } else {
        left.push(item);
      }
      return result;
    },
    {
      left: [],
      right: []
    }
  );
}

export function groupDataByWindow({ data, groupSize, groupMapper }) {
  const dataLength = data.length;
  if (dataLength < 2) {
    return [];
  }

  const sameGroup = pointsAreClose(groupSize);

  const result = [];
  let prevPoint = data[0];
  let currentGroup = [prevPoint];

  for (let i = 1; i !== dataLength; i++) {
    const point = data[i];
    if (sameGroup(prevPoint, point)) {
      currentGroup.push(point);
    } else {
      prevPoint = point;
      result.push(groupMapper(currentGroup));
      currentGroup = [prevPoint];
    }
  }

  if (currentGroup.length) {
    result.push(groupMapper(currentGroup));
  }

  return result;
}

function groupToValueMinMax(group) {
  const max = group.reduce(
    (result, point) => Math.max(result, point.value),
    Number.NEGATIVE_INFINITY
  );

  const min = group.reduce(
    (result, point) => Math.min(result, point.value),
    max
  );

  return {
    date: group[0].date,
    min,
    max
  };
}

function groupSizeFromChartToDate({ chartPointToDataPoint, groupSize }) {
  const start = chartPointToDataPoint({ x: 0 }).date;
  const end = chartPointToDataPoint({ x: groupSize }).date;
  return end - start;
}

const valueMinMaxToPoints = dataPointToChartPoint => ({ date, min, max }) => {
  if (min !== max) {
    return [
      dataPointToChartPoint({ date, value: max }),
      dataPointToChartPoint({ date, value: min })
    ];
  } else {
    return [dataPointToChartPoint({ date, value: min })];
  }
};

function pairsConnect(pair1, pair2) {
  const p1Max = pair1[0];
  const p1Min = pair1[1] || pair1[0];

  const p2Max = pair2[0];
  const p2Min = pair2[1] || pair2[0];

  if (p1Max.y < p2Min.y) {
    return [p1Max, p2Min];
  } else if (p1Min.y > p2Max.y) {
    return [p1Min, p2Max];
  } else {
    return undefined;
  }
}

export function drawSeries(params) {
  const { data, context, dataPointToChartPoint, lineColor } = params;

  const dataGroupSize = groupSizeFromChartToDate(params);
  const groupMapper = compose(
    valueMinMaxToPoints(dataPointToChartPoint),
    groupToValueMinMax
  );
  const pairs = groupDataByWindow({
    data,
    groupSize: dataGroupSize,
    groupMapper
  });

  context.beginPath();
  context.strokeStyle = lineColor;

  const drawPair = pair => {
    if (pair[1]) {
      context.moveTo(pair[0].x, pair[0].y);
      context.lineTo(pair[1].x, pair[1].y);
      context.moveTo(pair[1].x, (pair[1].y + pair[0].y) / 2);
    } else {
      context.lineTo(pair[0].x, pair[0].y);
    }
  };
  const startPair = pairs[0];
  if (startPair[1]) {
    drawPair(startPair);
  } else {
    context.moveTo(startPair[0].x, startPair[0].y);
  }

  pairs.slice(1).forEach((pair, index) => {
    const prevPair = pairs[index];
    const connect = pairsConnect(prevPair, pair);
    if (connect) {
      context.moveTo(connect[0].x, connect[0].y);
      context.lineTo(connect[1].x, connect[1].y);
    }
    drawPair(pair);
  });

  context.stroke();
}
