import { h } from "../../lib/vdom/h.mjs";
import { Component } from "../../lib/vdom/component.mjs";
import { bemClassProps } from "../../lib/utils.mjs";

import {
  setActiveFilterFrom,
  setActiveFilterTo
} from "../../actions/index.mjs";
import { YearSelector } from "../yearSelector/index.mjs";

const pClass = bemClassProps("filter");

export class Filter extends Component {
  render() {
    console.log(this.props);
    const { from, to, minYear, maxYear } = this.props;

    return h("div", pClass("root"), [
      h(
        "div",
        {
          ...pClass("left")
        },
        h(YearSelector, {
          value: from,
          min: minYear,
          max: maxYear,
          onSelect: setActiveFilterFrom
        })
      ),
      h(
        "div",
        {
          ...pClass("middle")
        },
        " - "
      ),
      h(
        "div",
        {
          ...pClass("right")
        },
        h(YearSelector, {
          value: to,
          min: minYear,
          max: maxYear,
          onSelect: setActiveFilterTo
        })
      )
    ]);
  }
}
