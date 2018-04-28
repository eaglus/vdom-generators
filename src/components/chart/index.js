import { h } from "../../lib/vdom/h.js";
import { merge } from "../../lib/utils/index.js";
import { bemClassProps } from "../../lib/utils/vdom.js";
import { lowerBound, upperBound, last } from "../../lib/utils/index.js";
import { Component } from "../../lib/vdom/component.js";

import { drawXAxis, drawYAxis } from "./axis.js";
import { restoreAfterRun } from "./utils.js";
import { provideSize } from "../../lib/utils/component.js";
import { drawSeries } from "./series.js";

const pClass = bemClassProps("chart");

function dateComparer(p1, p2) {
  return p1.date - p2.date;
}

const lineColor = "red";
const axisColor = "black";
const xAxisHeight = 50;
const xAxisLabelWidth = 60;
const yAxisWidth = 60;
const chartPadding = 10;
const axisFontHeight = 12;

const zoomStepFactor = 0.05;

class ChartComponent extends Component {
  constructor(props) {
    super();

    this.prevData = props.data;
    this.updateElement = this.updateElement.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { data, width, height } = this.props;
    return (
      nextProps.data !== data ||
      nextProps.width !== width ||
      nextProps.height !== height
    );
  }

  updateElement(element) {
    this.canvas = element;
    if (element) {
      this.context = this.canvas.getContext("2d");
      this.restoreAfterRun = restoreAfterRun(this.context, this);
      this.drawFunctions = {
        drawSeries: this.restoreAfterRun(this.drawSeries),
        drawXAxis: this.restoreAfterRun(drawXAxis),
        drawYAxis: this.restoreAfterRun(drawYAxis)
      };
    } else {
      this.context = null;
      this.restoreAfterRun = null;
    }
    this.props.setNode(element);
  }

  updateData(dataChanged) {
    const { data, width, height } = this.props;

    this.width = width - yAxisWidth - chartPadding * 2;
    this.height = height - xAxisHeight - chartPadding * 2;

    this.topOffset = chartPadding;
    this.leftOffset = chartPadding;

    const prevZoomXRange = this.zoomXRange;

    if (data.length) {
      this.zoomXRange = undefined;

      this.xRange = [data[0].date, last(data).date];
      this.setZoomXRange(dataChanged ? this.xRange : prevZoomXRange);
    } else {
      this.clear();
    }
  }

  setZoomXRange(range) {
    if (
      !this.zoomXRange ||
      range[0] !== this.zoomXRange[0] ||
      range[1] !== this.zoomXRange[1]
    ) {
      this.zoomXRange = range;

      const { data } = this.props;
      const [xMin, xMax] = this.zoomXRange;

      const zoomIndexL = lowerBound(data, { date: xMin }, dateComparer);
      const zoomIndexR = upperBound(data, { date: xMax }, dateComparer);

      this.zoomedData = data.slice(zoomIndexL, zoomIndexR);

      if (this.zoomedData.length) {
        this.yRange = this.zoomedData.reduce(
          (range, { value }) => [
            Math.min(value, range[0]),
            Math.max(value, range[1])
          ],
          [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
        );
      } else {
        this.yRange = [];
      }

      const [yMin, yMax] = this.yRange;

      this.xFactor = this.width / (xMax - xMin);
      this.yFactor = this.height / (yMax - yMin);
      this.xAdd = -xMin * this.xFactor;
      this.yAdd = -yMin * this.yFactor;

      this.dataPointToChartPoint = p => ({
        x:
          p.date !== undefined
            ? this.leftOffset + Math.floor(p.date * this.xFactor + this.xAdd)
            : undefined,
        y:
          p.value !== undefined
            ? this.topOffset +
              Math.floor(this.height - (p.value * this.yFactor + this.yAdd))
            : undefined
      });

      this.chartPointToDataPoint = ({ x, y }) => {
        let date;
        if (x !== undefined) {
          const dateDiff =
            (x - this.leftOffset) / this.width * this.getZoomXRangeWidth();
          date = xMin + dateDiff;
        }

        let value;
        if (y !== undefined) {
          const valueDiff =
            (y - this.topOffset) / this.height * this.getZoomYRangeWidth();
          value = yMin + valueDiff;
        }

        return {
          date,
          value
        };
      };

      this.draw();
    }
  }

  screenToClient({ screenX, screenY }) {
    const bcr = this.canvas.getBoundingClientRect();
    return {
      x: screenX - bcr.left,
      y: screenY - bcr.top
    };
  }

  getZoomXRangeWidth() {
    return this.zoomXRange[1] - this.zoomXRange[0];
  }

  getZoomYRangeWidth() {
    return this.yRange[1] - this.yRange[0];
  }

  onMouseWheel(e) {
    e.preventDefault();
    e.stopPropagation();

    const { deltaY } = e;
    const zoomDir = deltaY > 0 ? -1 : 1;
    const { x } = this.screenToClient(e);

    if (x > this.leftOffset && x < this.leftOffset + this.width) {
      const xPosRatio = (x - this.leftOffset) / this.width;
      const xRangeWidth = this.getZoomXRangeWidth();
      const dxLeft = xPosRatio * xRangeWidth * zoomStepFactor * zoomDir;
      const dxRight = (1 - xPosRatio) * xRangeWidth * zoomStepFactor * zoomDir;
      const [rangeStart, rangeStop] = this.xRange;
      const newZoomRange = [
        Math.max(this.zoomXRange[0] + dxLeft, rangeStart),
        Math.min(this.zoomXRange[1] - dxRight, rangeStop)
      ];
      this.setZoomXRange(newZoomRange);
    }
  }

  onMouseDown(e) {
    let { x: prevX } = this.screenToClient(e);
    e.preventDefault();

    const mouseMove = e => {
      const { x, y } = this.screenToClient(e);
      const { date } = this.chartPointToDataPoint({ x, y });
      const { date: prevDate } = this.chartPointToDataPoint({ x: prevX, y });
      prevX = x;

      const [rangeStart, rangeStop] = this.xRange;
      const diff = prevDate - date;
      const diffFixed =
        diff < 0
          ? Math.max(rangeStart - this.zoomXRange[0], diff)
          : Math.min(rangeStop - this.zoomXRange[1], diff);

      const newZoomRange = [
        this.zoomXRange[0] + diffFixed,
        this.zoomXRange[1] + diffFixed
      ];
      this.setZoomXRange(newZoomRange);
    };

    const mouseUp = () => {
      document.removeEventListener("mousemove", mouseMove, true);
      document.removeEventListener("mouseup", mouseUp, true);
    };

    document.addEventListener("mousemove", mouseMove, true);
    document.addEventListener("mouseup", mouseUp, true);
  }

  componentDidUpdate() {
    const { data } = this.props;
    const dataChanged = this.prevData !== data;

    this.prevData = data;

    this.updateData(dataChanged);
  }

  clear() {
    this.context.clearRect(0, 0, this.props.width, this.props.height);
  }

  draw() {
    requestAnimationFrame(() => {
      this.clear();

      this.drawFunctions.drawSeries();

      const axisOptions = {
        context: this.context,
        chartPointToDataPoint: this.chartPointToDataPoint,
        dataPointToChartPoint: this.dataPointToChartPoint,
        fontHeight: axisFontHeight,
        color: axisColor
      };

      this.drawFunctions.drawYAxis(
        merge(axisOptions, {
          left: this.leftOffset + this.width + chartPadding,
          top: this.topOffset,
          width: yAxisWidth - chartPadding,
          height: this.height
        })
      );

      this.drawFunctions.drawXAxis(
        merge(axisOptions, {
          left: this.leftOffset,
          top: this.topOffset + this.height + chartPadding,
          width: this.width,
          fontHeight: axisFontHeight,
          labelWidth: xAxisLabelWidth
        })
      );
    });
  }

  drawSeries() {
    if (this.zoomedData.length) {
      const ctx = this.context;
      ctx.beginPath();
      ctx.rect(this.leftOffset, this.topOffset, this.width, this.height);
      ctx.clip();

      drawSeries({
        data: this.zoomedData,
        context: this.context,
        dataPointToChartPoint: this.dataPointToChartPoint,
        chartPointToDataPoint: this.chartPointToDataPoint,
        groupSize: 2,
        lineColor
      });
    }
  }

  render() {
    return h(
      "canvas",
      merge(pClass("root"), {
        width: this.props.width,
        height: this.props.height,
        onMount: this.updateElement,
        onUnmount: this.updateElement,
        onWheel: this.onMouseWheel,
        onMouseDown: this.onMouseDown
      })
    );
  }
}

export const Chart = provideSize(ChartComponent);
