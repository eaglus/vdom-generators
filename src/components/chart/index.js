import { h } from "../../lib/vdom/h.js";
import { bemClassProps } from "../../lib/utils/vdom.js";
import { Component } from "../../lib/vdom/component.js";
import { Loader } from "../loader/index.js";

const pClass = bemClassProps("chart");

export class Chart extends Component {
  render() {
    const { data, isLoading } = this.props;
    return [h("canvas", pClass("root")), isLoading ? h(Loader, {}) : null];
  }
}
