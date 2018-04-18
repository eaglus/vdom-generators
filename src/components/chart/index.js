import { h } from "../../lib/vdom/h.js";
import { bemClassProps } from "../../lib/utils/vdom.js";
import { Component } from "../../lib/vdom/component.js";

const pClass = bemClassProps("chart");

export class Chart extends Component {
  render() {
    const { dataFiltered } = this.props;
    return h("canvas", pClass("root"));
  }
}
