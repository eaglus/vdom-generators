import { h } from "../../lib/vdom/h.js";
import { Component } from "../../lib/vdom/component.js";
import { bemClassProps } from "../../lib/utils/vdom.js";

import { loadForFilterFrom, loadForFilterTo } from "../../actions/index.js";
import { YearSelector } from "../yearSelector/index.js";

const pClass = bemClassProps("filter");

export class Filter extends Component {
  render() {
    const { from, to, minYear, maxYear } = this.props;

    return h("div", pClass("root"), [
      h(
        "div",
        pClass("left"),
        h(YearSelector, {
          value: from,
          min: minYear,
          max: maxYear,
          onSelect: loadForFilterFrom
        })
      ),
      h("div", pClass("middle"), " - "),
      h(
        "div",
        pClass("right"),
        h(YearSelector, {
          value: to,
          min: minYear,
          max: maxYear,
          onSelect: loadForFilterTo
        })
      )
    ]);
  }
}
