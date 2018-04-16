import { h } from "../../lib/vdom/h.mjs";
import { bemClassProps } from "../../lib/utils.mjs";
import { Chart } from "../chart/index.mjs";
import { Filter } from "../filter/index.mjs";

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
