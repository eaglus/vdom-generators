import { h } from "../../lib/vdom/h.mjs";
import { bemClassProps } from "../../lib/utils.mjs";
import { Component } from "../../lib/vdom/component.mjs";

const pClass = bemClassProps("chart");

export class Chart extends Component {
  render() {
    const { dataFiltered } = this.props;
    return h("canvas", pClass("root"));
  }
}
