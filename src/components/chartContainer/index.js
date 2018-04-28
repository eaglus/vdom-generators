import { h } from "../../lib/vdom/h.js";
import { merge } from "../../lib/utils/index.js";
import { bemClassProps } from "../../lib/utils/vdom.js";
import { Chart } from "../chart/index.js";
import { Filter } from "../filter/index.js";
import { Loader } from "../loader/index.js";

const pClass = bemClassProps("chart-container");

export function ChartContainer(props) {
  const { activeFilter, chartData, minYear, maxYear } = props;

  return [
    h(
      "div",
      pClass("filter-row"),
      h(Filter, merge(activeFilter, { minYear, maxYear }))
    ),
    h("div", pClass("chart"), [
      h(Chart, chartData),
      chartData.isLoading ? h(Loader, {}) : null
    ])
  ];
}
