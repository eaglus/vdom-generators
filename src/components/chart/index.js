import { h } from "../../lib/vdom/h.js";
import { bemClassProps } from "../../lib/utils/vdom.js";
import { Component } from "../../lib/vdom/component.js";

const pClass = bemClassProps("chart");

function last(data) {
  return data[data.length - 1];
}

const lineColor = "red";

export class Chart extends Component {
  constructor() {
    super();
    this.updateElement = this.updateElement.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.data !== this.props.data;
  }

  updateElement(element) {
    this.canvas = element;
    if (element) {
      this.context = this.canvas.getContext("2d");
    } else {
      this.context = null;
    }
  }

  updateData() {
    const { data } = this.props;
    if (data.length) {
      this.xRange = [data[0].date, last(data).date];
      this.yRange = data.reduce(
        (range, { value }) => [
          Math.min(value, range[0]),
          Math.max(value, range[1])
        ],
        [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
      );
    } else {
      this.xRange = [];
      this.yRange = [];
    }

    const [xMin, xMax] = this.xRange;
    const [yMin, yMax] = this.yRange;

    this.xFactor = this.width / (xMax - xMin);
    this.yFactor = this.height / (yMax - yMin);
    this.xAdd = -xMin * this.xFactor;
    this.yAdd = -yMin * this.yFactor;

    this.dataPointToChart = p => ({
      x: Math.round(p.date * this.xFactor + this.xAdd),
      y: Math.round(this.height - (p.value * this.yFactor + this.yAdd))
    });
    //this.dataPointToChart = p => p;

    this.context.clearRect(0, 0, this.width, this.height);
    this.drawSerie();
  }

  drawSerie() {
    const ctx = this.context;
    ctx.strokeStyle = lineColor;

    const { data } = this.props;
    const ln = data.length;
    if (data.length) {
      let prevP = this.dataPointToChart(data[0]);
      ctx.moveTo(prevP.x, prevP.y);

      ctx.beginPath();
      for (let i = 1; i !== ln; i++) {
        const p = this.dataPointToChart(data[i]);
        if (p.x - prevP.x > -1) {
          prevP = p;
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
    }
  }

  componentDidMount() {
    this.width = this.canvas.offsetWidth;
    this.height = this.canvas.offsetHeight;
    this.updateData();
  }

  componentDidUpdate() {
    this.updateData();
  }

  render() {
    const { data } = this.props;
    return h("canvas", {
      ...pClass("root"),
      width: this.width || 798,
      height: this.height || 659,
      onMount: this.updateElement,
      onUnmount: this.updateElement
    });
  }
}
