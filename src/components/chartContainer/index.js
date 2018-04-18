import { h } from "../../lib/vdom/h.js";
import { bemClassProps } from "../../lib/utils/vdom.js";
import { Chart } from "../chart/index.js";
import { Filter } from "../filter/index.js";

const pClass = bemClassProps("chart-container");

export function ChartContainer(props) {
  const { activeFilter, dataFiltered, minYear, maxYear } = props;

  return [
    h(
      "div",
      pClass("filter-row"),
      h(Filter, { ...activeFilter, minYear, maxYear })
    ),
    h("div", pClass("chart"), h(Chart, { dataFiltered }))
  ];
}
