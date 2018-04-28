import { Component } from "../vdom/component.js";
import { h } from "../vdom/h.js";
import { merge } from "../utils/index.js";

export function provideSize(component) {
  class Provider extends Component {
    constructor() {
      super();
      this.state = {
        width: "",
        height: ""
      };

      this.setNode = this.setNode.bind(this);
      this.updateSize = this.updateSize.bind(this);
    }

    setNode(node) {
      this.node = node;
      this.updateSize();
    }

    updateSize() {
      this.setState({
        width: this.node.offsetWidth,
        height: this.node.offsetHeight
      });
    }

    componentDidMount() {
      window.addEventListener("resize", this.updateSize);
    }

    componentWillUnmount() {
      window.addEventListener("resize", this.updateSize);
    }

    render() {
      return h(
        component,
        merge(this.props, {
          width: this.state.width,
          height: this.state.height,
          setNode: this.setNode
        })
      );
    }
  }

  return Provider;
}
