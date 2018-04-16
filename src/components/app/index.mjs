import { h } from "../../lib/vdom/h.mjs";
import { bemClassProps } from "../../lib/utils.mjs";
import { Component } from "../../lib/vdom/component.mjs";

import { ActiveFilterSelector } from "../activeFilterSelector/index.mjs";
import { ChartContainer } from "../chartContainer/index.mjs";

const pClass = bemClassProps("app");

export class App extends Component {
  render() {
    const { filter, dataFiltered } = this.props;
    const { activeFilterType, minYear, maxYear } = filter;
    const activeFilter = filter[activeFilterType];
    return h(
      "div",
      pClass("root"),
      h("div", pClass("center-container"), [
        h("div", pClass("header"), "Архив метеослужбы"),
        h("div", pClass("content"), [
          h(
            "div",
            pClass("content-left"),
            h(ActiveFilterSelector, { ...filter })
          ),
          h(
            "div",
            pClass("content-right"),
            h(ChartContainer, { activeFilter, minYear, maxYear, dataFiltered })
          )
        ])
      ])
    );
  }
}
